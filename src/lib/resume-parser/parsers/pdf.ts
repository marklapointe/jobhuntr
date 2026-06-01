const pdfParse = require('pdf-parse')

export async function parsePdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  return data.text
}
