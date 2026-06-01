import { Worker, Job } from 'bullmq'
import Redis from 'ioredis'

interface JobData {
  id: string
  type: string
  data: Record<string, unknown>
}

interface JobProcessorConfig {
  redisUrl: string
  workerId: string
  maxConcurrent: number
  onResult: (result: unknown) => void
}

export class JobProcessor {
  private worker?: Worker
  private redis: Redis
  private workerId: string
  private maxConcurrent: number
  private onResult: (result: unknown) => void
  private activeJobs: Map<string, Job> = new Map()
  private isRunning = false

  constructor(config: JobProcessorConfig) {
    this.redis = new Redis(config.redisUrl)
    this.workerId = config.workerId
    this.maxConcurrent = config.maxConcurrent
    this.onResult = config.onResult
  }

  start(): void {
    if (this.isRunning) return
    this.isRunning = true

    this.worker = new Worker('application', async (job) => {
      this.activeJobs.set(job.id!, job)
      
      try {
        const result = await this.processJob(job.data)
        this.onResult({ jobId: job.id, status: 'completed', result })
        return result
      } catch (error) {
        this.onResult({ jobId: job.id, status: 'failed', error: (error as Error).message })
        throw error
      } finally {
        this.activeJobs.delete(job.id!)
      }
    }, {
      connection: { host: 'localhost', port: 6379 },
      concurrency: this.maxConcurrent,
    })

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err.message)
      this.activeJobs.delete(job?.id!)
    })

    console.log(`JobProcessor for worker ${this.workerId} started`)
  }

  stop(): void {
    this.isRunning = false
    this.worker?.close()
    this.activeJobs.clear()
  }

  addJob(jobData: JobData): void {
    this.redis.publish('jobs', JSON.stringify(jobData))
  }

  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId)
    if (job) {
      job.discard()
      this.activeJobs.delete(jobId)
      return true
    }
    return false
  }

  getActiveJobs(): number {
    return this.activeJobs.size
  }

  private async processJob(data: Record<string, unknown>): Promise<unknown> {
    return { processed: true, data, workerId: this.workerId }
  }
}