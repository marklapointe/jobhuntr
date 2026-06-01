import { Worker, Job } from 'bullmq'
import { QueueJob } from './index'
import { checkRateLimit, waitForRateLimit } from './rate-limiter'
import { executeWithCircuitBreaker } from './circuit-breaker'

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379', maxRetriesPerRequest: null }

export type JobProcessor = (job: Job) => Promise<unknown>

const processors: Map<string, JobProcessor> = new Map()

export function registerProcessor(type: string, processor: JobProcessor): void {
  processors.set(type, processor)
}

export function createWorker(name: string, processor: JobProcessor): Worker {
  registerProcessor(name, processor)

  const worker = new Worker(name, async (job) => {
    const url = job.data.url as string | undefined
    const domain = url ? extractDomain(url) : 'unknown'

    await waitForRateLimit(domain)

    return executeWithCircuitBreaker(
      domain,
      async () => {
        const proc = processors.get(job.queueName) || processor
        return proc(job)
      },
      async () => {
        throw new Error(`Circuit breaker open for domain: ${domain}`)
      }
    )
  }, {
    connection: connection as any,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  })

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed in queue ${job.queueName}`)
  })

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed in queue ${job?.queueName}:`, err.message)
  })

  return worker
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return 'unknown'
  }
}

export { Worker, Job }
