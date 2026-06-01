import WebSocket from 'ws'
import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { WorkerRegistration } from './registration'
import { Heartbeat } from './heartbeat'
import { JobProcessor } from './job-processor'

export interface WorkerConfig {
  workerId: string
  c2WsUrl: string
  redisUrl: string
  maxConcurrent?: number
  capabilities?: string[]
}

export class WorkerNodeService {
  private workerId: string
  private c2WsUrl: string
  private redisUrl: string
  private maxConcurrent: number
  private capabilities: string[]
  private ws?: WebSocket
  private registration?: WorkerRegistration
  private heartbeat?: Heartbeat
  private jobProcessor?: JobProcessor
  private redis?: Redis
  private isRunning = false

  constructor(config: WorkerConfig) {
    this.workerId = config.workerId
    this.c2WsUrl = config.c2WsUrl
    this.redisUrl = config.redisUrl
    this.maxConcurrent = config.maxConcurrent || 5
    this.capabilities = config.capabilities || ['browser', 'scraping']
  }

  async start(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true

    this.redis = new Redis(this.redisUrl)

    await this.connectToC2()
    this.startJobProcessor()

    console.log(`Worker ${this.workerId} started`)
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return
    this.isRunning = false

    this.heartbeat?.stop()
    this.jobProcessor?.stop()
    
    if (this.ws) {
      this.ws.close()
    }
    
    if (this.redis) {
      await this.redis.quit()
    }

    console.log(`Worker ${this.workerId} stopped`)
  }

  private async connectToC2(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.c2WsUrl)

      this.ws.on('open', async () => {
        this.registration = new WorkerRegistration(this.ws!, {
          workerId: this.workerId,
          maxConcurrent: this.maxConcurrent,
          capabilities: this.capabilities,
        })
        
        await this.registration.register()
        
        this.heartbeat = new Heartbeat(this.ws!, this.workerId)
        this.heartbeat.start()

        resolve()
      })

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data)
      })

      this.ws.on('close', () => {
        console.log(`Worker ${this.workerId} disconnected from C2, reconnecting...`)
        setTimeout(() => this.connectToC2(), 5000)
      })

      this.ws.on('error', (error: Error) => {
        console.error(`Worker ${this.workerId} WebSocket error:`, error)
        reject(error)
      })
    })
  }

  private startJobProcessor(): void {
    this.jobProcessor = new JobProcessor({
      redisUrl: this.redisUrl,
      workerId: this.workerId,
      maxConcurrent: this.maxConcurrent,
      onResult: (result) => this.sendResult(result),
    })
    
    this.jobProcessor.start()
  }

  private handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString())
      
      switch (message.type) {
        case 'job':
          this.jobProcessor?.addJob(message.data)
          break
        case 'cancel':
          this.jobProcessor?.cancelJob(message.jobId)
          break
        case 'ping':
          this.ws?.send(JSON.stringify({ type: 'pong' }))
          break
        default:
          console.log(`Unknown message type: ${message.type}`)
      }
    } catch (error) {
      console.error('Error handling message:', error)
    }
  }

  private sendResult(result: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'job_result',
        workerId: this.workerId,
        result,
      }))
    }
  }

  getStatus(): { workerId: string; isRunning: boolean; activeJobs: number } {
    return {
      workerId: this.workerId,
      isRunning: this.isRunning,
      activeJobs: this.jobProcessor?.getActiveJobs() || 0,
    }
  }
}