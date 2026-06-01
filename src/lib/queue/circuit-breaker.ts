type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeoutMs: number
}

interface CircuitBreakerStats {
  failures: number
  lastFailure: number
  state: CircuitState
}

const circuits: Map<string, CircuitBreakerStats> = new Map()
const configs: Map<string, CircuitBreakerConfig> = new Map()

export function configureCircuitBreaker(name: string, failureThreshold = 5, resetTimeoutMs = 300000): void {
  configs.set(name, { failureThreshold, resetTimeoutMs })
  circuits.set(name, { failures: 0, lastFailure: 0, state: 'CLOSED' })
}

export function getCircuitState(name: string): CircuitState {
  const circuit = circuits.get(name)
  if (!circuit) return 'CLOSED'

  if (circuit.state === 'OPEN') {
    const config = configs.get(name)
    if (config && Date.now() - circuit.lastFailure >= config.resetTimeoutMs) {
      circuit.state = 'HALF_OPEN'
    }
  }

  return circuit.state
}

export function isCircuitOpen(name: string): boolean {
  return getCircuitState(name) === 'OPEN'
}

export async function executeWithCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  const state = getCircuitState(name)

  if (state === 'OPEN') {
    if (fallback) {
      return fallback()
    }
    throw new Error(`Circuit breaker '${name}' is OPEN`)
  }

  try {
    const result = await fn()
    recordSuccess(name)
    return result
  } catch (error) {
    recordFailure(name)
    const newState = getCircuitState(name)
    if (newState === 'OPEN' && fallback) {
      return fallback()
    }
    throw error
  }
}

function recordSuccess(name: string): void {
  const circuit = circuits.get(name)
  if (circuit) {
    circuit.failures = 0
    circuit.state = 'CLOSED'
  }
}

function recordFailure(name: string): void {
  let circuit = circuits.get(name)
  if (!circuit) {
    configureCircuitBreaker(name)
    circuit = circuits.get(name)!
  }

  circuit.failures++
  circuit.lastFailure = Date.now()

  const config = configs.get(name)
  if (config && circuit.failures >= config.failureThreshold) {
    circuit.state = 'OPEN'
  }
}

export function resetCircuitBreaker(name: string): void {
  const circuit = circuits.get(name)
  if (circuit) {
    circuit.failures = 0
    circuit.state = 'CLOSED'
  }
}

export function resetAllCircuitBreakers(): void {
  circuits.forEach((_, name) => resetCircuitBreaker(name))
}

export function getCircuitBreakerStats(name: string): { state: CircuitState; failures: number } | null {
  const circuit = circuits.get(name)
  if (!circuit) return null
  return { state: circuit.state, failures: circuit.failures }
}
