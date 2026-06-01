import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export const GET = auth((req) => {
  return NextResponse.json(req.auth)
})

export const POST = auth((req) => {
  return NextResponse.json(req.auth)
})
