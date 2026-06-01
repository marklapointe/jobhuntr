import { auth } from '@/auth'

export default auth

export const config = {
  matcher: ['/((?!auth|_next/static|_next/image|favicon.ico).*)'],
}
