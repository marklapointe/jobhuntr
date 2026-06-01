import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { parseResume } from '@/lib/resume-parser'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: { message: 'No file provided' } }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileType = file.name.split('.').pop()?.toLowerCase() || 'txt'
    
    // Determine file type
    let parsedFileType: 'pdf' | 'docx' | 'txt' | 'html' | 'image'
    switch (fileType) {
      case 'pdf': parsedFileType = 'pdf'; break
      case 'docx': parsedFileType = 'docx'; break
      case 'html': parsedFileType = 'html'; break
      case 'jpg':
      case 'jpeg':
      case 'png':
        parsedFileType = 'image'; break
      default: parsedFileType = 'txt'
    }

    // Parse resume
    const parseResult = await parseResume(buffer, parsedFileType)

    // Save resume record
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileType: fileType,
        fileSize: buffer.length,
        parseStatus: 'COMPLETED',
        rawText: parseResult.rawText,
        parsedData: parseResult as object,
      },
    })

    return NextResponse.json({
      data: {
        id: resume.id,
        fileName: resume.fileName,
        parseStatus: resume.parseStatus,
        overallConfidence: parseResult.overallConfidence,
      },
    })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json(
      { error: { message: 'Failed to process resume' } },
      { status: 500 }
    )
  }
}
