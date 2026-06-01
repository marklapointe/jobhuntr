import { Page, Locator, ElementHandle } from 'playwright'

export async function navigate(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
}

export async function click(page: Page, selector: string): Promise<void> {
  await page.click(selector, { timeout: 10000 })
}

export async function fill(page: Page, selector: string, text: string): Promise<void> {
  await page.fill(selector, text)
}

export async function submit(page: Page, selector: string): Promise<void> {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
    page.click(selector),
  ])
}

export async function waitForSelector(page: Page, selector: string, timeout = 10000): Promise<ElementHandle> {
  return page.waitForSelector(selector, { timeout })
}

export async function getValue(page: Page, selector: string): Promise<string> {
  return page.inputValue(selector)
}

export async function getText(page: Page, selector: string): Promise<string> {
  const text = await page.textContent(selector)
  return text ?? ''
}

export async function selectOption(page: Page, selector: string, value: string): Promise<void> {
  await page.selectOption(selector, value)
}

export async function uploadFile(page: Page, selector: string, filePath: string): Promise<void> {
  await page.setInputFiles(selector, filePath)
}

export async function hover(page: Page, selector: string): Promise<void> {
  await page.hover(selector)
}

export async function pressKey(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key)
}

export async function typeText(page: Page, text: string, delay = 50): Promise<void> {
  await page.keyboard.type(text, { delay })
}

export async function isVisible(page: Page, selector: string): Promise<boolean> {
  return page.isVisible(selector)
}

export async function isEnabled(page: Page, selector: string): Promise<boolean> {
  return page.isEnabled(selector)
}

export async function waitForNavigation(page: Page, timeout = 30000): Promise<void> {
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout })
}

export async function getAttribute(page: Page, selector: string, attribute: string): Promise<string | null> {
  return page.getAttribute(selector, attribute)
}

export async function screenshot(page: Page, path: string): Promise<void> {
  await page.screenshot({ path, fullPage: true })
}
