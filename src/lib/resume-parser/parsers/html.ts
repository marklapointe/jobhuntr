import * as cheerio from 'cheerio'

export async function parseHtml(buffer: Buffer): Promise<string> {
  const html = buffer.toString('utf-8')
  const $ = cheerio.load(html)

  // Remove script and style elements
  $('script, style').remove()

  // Get text content
  const text = $('body').text()

  // Clean up whitespace
  return text.replace(/\s+/g, ' ').trim()
}
