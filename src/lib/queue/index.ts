import { Queue, Worker, Job } from 'bullmq'

export type JobType = 'scrape' | 'apply' | 'optimize' | 'email' | 'agent'
export type JobPriority = 'high' | 'normal' | 'low'

export interface QueueJob {
  id: string
  type: JobType
  data: Record<string, unknown>
  priority?: JobPriority
  retries?: number
}

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379', maxRetriesPerRequest: null }

export const queues: Record<string, Queue> = {
  application: new Queue('application', { connection }),
  scraping: new Queue('scraping', { connection }),
  email: new Queue('email', { connection }),
  optimization: new Queue('optimization', { connection }),
}

export function getQueue(type: JobType): Queue<QueueJob> {
  switch (type) {
    case 'apply':
      return queues.application
    case 'scrape':
      return queues.scraping
    case 'email':
      return queues.email
    case 'optimize':
      return queues.optimization
    case 'agent':
      return queues.application
    default:
      return queues.application
  }
}

export function getPriorityValue(priority: JobPriority): number {
  switch (priority) {
    case 'high': return 1
    case 'normal': return 2
    case 'low': return 3
    default: return 2
  }
}

export async function addJob(job: QueueJob): Promise<Job<QueueJob>> {
  const queue = getQueue(job.type)
  const options: Record<string, unknown> = {
    jobId: job.id,
    attempts: job.retries || 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  }

  if (job.priority) {
    options.priority = getPriorityValue(job.priority)
  }

  return queue.add(job.type, job.data as any, options as any)
}

export { Worker, Job }
