import { parsePdf } from './parsers/pdf'
import { parseDocx } from './parsers/docx'
import { parseTxt } from './parsers/txt'
import { parseHtml } from './parsers/html'
import { parseImage } from './parsers/ocr'
import { extractContact, extractExperience, extractEducation, extractSkills } from './extractor'
import { ParseResult, FileType } from './types'

export async function parseResume(buffer: Buffer, fileType: FileType): Promise<ParseResult> {
  let rawText: string

  switch (fileType) {
    case 'pdf':
      rawText = await parsePdf(buffer)
      break
    case 'docx':
      rawText = await parseDocx(buffer)
      break
    case 'txt':
      rawText = await parseTxt(buffer)
      break
    case 'html':
      rawText = await parseHtml(buffer)
      break
    case 'image':
      rawText = await parseImage(buffer)
      break
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }

  const contact = extractContact(rawText)
  const experience = extractExperience(rawText)
  const education = extractEducation(rawText)
  const skills = extractSkills(rawText)

  const confidences = [
    contact.confidence,
    experience.confidence,
    education.confidence,
    skills.confidence,
  ].filter(c => c > 0)

  const overallConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0

  return {
    contact,
    experience,
    education,
    skills,
    rawText,
    overallConfidence,
  }
}

export { parsePdf } from './parsers/pdf'
export { parseDocx } from './parsers/docx'
export { parseTxt } from './parsers/txt'
export { parseHtml } from './parsers/html'
export { parseImage } from './parsers/ocr'
export { extractContact, extractExperience, extractEducation, extractSkills } from './extractor'
export type { ParseResult, FileType, ContactInfo, Experience, Education, Skill } from './types'
