import { Page } from 'playwright'

type CaptchaType = 'recaptcha' | 'hcaptcha' | 'image' | 'text'

async function detectCaptcha(page: Page): Promise<CaptchaType | null> {
  const recaptcha = await page.locator('.g-recaptcha, [data-sitekey]').count()
  if (recaptcha > 0) return 'recaptcha'

  const hcaptcha = await page.locator('.h-captcha, [data-hcaptcha-sitekey]').count()
  if (hcaptcha > 0) return 'hcaptcha'

  const imageCaptcha = await page.locator('img[alt*="captcha" i], .captcha-image, #captcha-image').count()
  if (imageCaptcha > 0) return 'image'

  const textCaptcha = await page.locator('input[name*="captcha" i], input[id*="captcha" i]').count()
  if (textCaptcha > 0) return 'text'

  const pageContent = await page.content()
  if (pageContent.includes('grecaptcha') || pageContent.includes('hcaptcha')) {
    return pageContent.includes('grecaptcha') ? 'recaptcha' : 'hcaptcha'
  }

  return null
}

async function waitForCaptchaSolve(page: Page, timeout = 60000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const type = await detectCaptcha(page)
    if (type === null) return true
    await page.waitForTimeout(1000)
  }
  return false
}

export type { CaptchaType }
export { detectCaptcha, waitForCaptchaSolve }
