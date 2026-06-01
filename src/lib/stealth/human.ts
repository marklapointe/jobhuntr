import { Page, Keyboard, Mouse } from 'playwright'

interface Point {
  x: number
  y: number
}

function bezierPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const t2 = t * t
  const t3 = t2 * t
  const mt = 1 - t
  const mt2 = mt * mt
  const mt3 = mt2 * mt

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  }
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

async function humanTyping(page: Page, text: string): Promise<void> {
  const minDelay = 50
  const maxDelay = 150

  for (const char of text) {
    await page.keyboard.type(char, { delay: randomBetween(minDelay, maxDelay) })
    if (Math.random() > 0.9) {
      await page.waitForTimeout(randomBetween(100, 300))
    }
  }
}

async function humanMouseMove(page: Page, from: Point, to: Point): Promise<void> {
  const duration = randomBetween(500, 1500)
  const steps = Math.floor(duration / 16)
  const p1: Point = { x: from.x + randomBetween(-50, 50), y: from.y + randomBetween(-50, 50) }
  const p2: Point = { x: to.x + randomBetween(-50, 50), y: to.y + randomBetween(-50, 50) }

  await page.mouse.move(from.x, from.y)

  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const point = bezierPoint(from, p1, p2, to, t)
    await page.mouse.move(point.x, point.y)
    await page.waitForTimeout(16)
  }
}

async function humanScroll(page: Page, start: number, end: number): Promise<void> {
  const steps = Math.abs(end - start) / 50
  const direction = end > start ? 1 : -1

  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, direction * 50)
    await page.waitForTimeout(randomBetween(20, 80))
  }
}

async function humanClick(page: Page, point: Point): Promise<void> {
  await humanMouseMove(page, { x: point.x - 10, y: point.y - 10 }, point)
  await page.waitForTimeout(randomBetween(50, 150))
  await page.mouse.click(point.x, point.y)
}

export { humanTyping, humanMouseMove, humanScroll, humanClick, type Point }
