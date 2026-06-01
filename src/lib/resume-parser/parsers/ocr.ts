import Tesseract from 'tesseract.js'

export async function parseImage(buffer: Buffer): Promise<string> {
  const result = await Tesseract.recognize(buffer, 'eng', {
    logger: () => {},
  })
  return result.data.text
}
