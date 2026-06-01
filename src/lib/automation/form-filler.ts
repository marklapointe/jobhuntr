import { Page } from 'playwright'
import { browserPool } from '@/lib/browser/pool'
import { sessionManager } from '@/lib/browser/session'

export interface FormField {
  name: string
  value: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'file'
}

export interface FormFillerConfig {
  atsType: 'greenhouse' | 'lever' | 'ashby' | 'workday'
  jobUrl: string
  fields: FormField[]
}

export async function fillApplicationForm(config: FormFillerConfig): Promise<{ success: boolean; error?: string }> {
  const pooled = await browserPool.acquire()
  
  try {
    const { page } = pooled
    
    // Navigate to job page
    await page.goto(config.jobUrl, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Click apply button if present
    const applyButton = await page.$('button:has-text("Apply"), a:has-text("Apply")')
    if (applyButton) {
      await applyButton.click()
      await page.waitForLoadState('networkidle')
    }
    
    // Fill fields based on ATS type
    for (const field of config.fields) {
      await fillField(page, field)
    }
    
    // Upload resume if file field exists
    const fileField = config.fields.find(f => f.type === 'file')
    if (fileField) {
      await page.setInputFiles('input[type="file"]', fileField.value)
    }
    
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Form filling failed' 
    }
  } finally {
    browserPool.release(pooled)
  }
}

async function fillField(page: Page, field: FormField): Promise<void> {
  const selector = getFieldSelector(field)
  
  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'textarea':
      await page.fill(selector, field.value)
      break
    case 'select':
      await page.selectOption(selector, field.value)
      break
    case 'checkbox':
      if (field.value === 'true') {
        await page.check(selector)
      }
      break
  }
}

function getFieldSelector(field: FormField): string {
  // Try common selector patterns
  return `input[name="${field.name}"], textarea[name="${field.name}"], select[name="${field.name}"]`
}
