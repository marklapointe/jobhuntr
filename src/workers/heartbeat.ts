import WebSocket from 'ws'

export class Heartbeat {
  private ws: WebSocket
  private workerId: string
  private interval?: NodeJS.Timeout
  private intervalMs = 30000

  constructor(ws: WebSocket, workerId: string) {
    this.ws = ws
    this.workerId = workerId
  }

  start(): void {
    if (this.interval) return
    
    this.interval = setInterval(() => {
      this.send()
    }, this.intervalMs)
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = undefined
    }
  }

  private send(): void {
    if (this.ws.readyState !== WebSocket.OPEN) return

    this.ws.send(JSON.stringify({
      type: 'heartbeat',
      workerId: this.workerId,
      timestamp: Date.now(),
      status: 'alive',
    }))
  }
}