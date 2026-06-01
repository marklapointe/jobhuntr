import WebSocket from 'ws'

interface RegistrationData {
  workerId: string
  maxConcurrent: number
  capabilities: string[]
}

export class WorkerRegistration {
  private ws: WebSocket
  private data: RegistrationData

  constructor(ws: WebSocket, data: RegistrationData) {
    this.ws = ws
    this.data = data
  }

  async register(): Promise<void> {
    return new Promise((resolve, reject) => {
      const message = {
        type: 'register',
        ...this.data,
        timestamp: Date.now(),
      }

      const timeout = setTimeout(() => {
        reject(new Error('Registration timeout'))
      }, 10000)

      const handler = (data: WebSocket.Data) => {
        try {
          const response = JSON.parse(data.toString())
          if (response.type === 'register_ack' && response.workerId === this.data.workerId) {
            clearTimeout(timeout)
            this.ws.off('message', handler)
            resolve()
          }
        } catch {
          // Ignore parse errors
        }
      }

      this.ws.on('message', handler)
      this.ws.send(JSON.stringify(message))
    })
  }

  sendUnregister(): void {
    this.ws.send(JSON.stringify({
      type: 'unregister',
      workerId: this.data.workerId,
      timestamp: Date.now(),
    }))
  }
}