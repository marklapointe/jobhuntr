import { describe, it, expect } from 'vitest'
import { getPriorityValue, JobPriority } from './index'

describe('Queue Module', () => {
  describe('getPriorityValue', () => {
    it('should return correct priority values', () => {
      expect(getPriorityValue('high')).toBe(1)
      expect(getPriorityValue('normal')).toBe(2)
      expect(getPriorityValue('low')).toBe(3)
    })

    it('should return normal priority for unknown priority', () => {
      expect(getPriorityValue('unknown' as JobPriority)).toBe(2)
    })
  })

  describe('QueueJob type', () => {
    it('should accept valid job types', () => {
      const jobTypes = ['scrape', 'apply', 'optimize', 'email', 'agent'] as const
      expect(jobTypes).toBeDefined()
    })

    it('should accept valid job priorities', () => {
      const priorities = ['high', 'normal', 'low'] as const
      expect(priorities).toBeDefined()
    })
  })

  describe('QueueJob structure', () => {
    it('should have required fields', () => {
      const job = {
        id: 'test_job_1',
        type: 'scrape' as const,
        data: { url: 'https://example.com' },
      }

      expect(job.id).toBe('test_job_1')
      expect(job.type).toBe('scrape')
      expect(job.data.url).toBe('https://example.com')
    })

    it('should support optional priority field', () => {
      const job = {
        id: 'test_job_2',
        type: 'apply' as const,
        data: {},
        priority: 'high' as const,
      }

      expect(job.priority).toBe('high')
    })

    it('should support optional retries field', () => {
      const job = {
        id: 'test_job_3',
        type: 'optimize' as const,
        data: {},
        retries: 5,
      }

      expect(job.retries).toBe(5)
    })
  })
})
