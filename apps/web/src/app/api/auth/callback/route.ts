import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { acceptInvite } from '@/http/accept-invite'
import { signInWithGithub } from '@/http/sign-in-with-github'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { message: 'Github OAuth  code was not found.' },
      { status: 400 },
    )
  }

  const { token } = await signInWithGithub({ code })

  cookies().then((cookies) =>
    cookies.set('token', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7days
    }),
  )

  const inviteId = await cookies().then(
    (cookies) => cookies.get('inviteId')?.value,
  )

  if (inviteId) {
    try {
      await acceptInvite(inviteId)
      cookies().then((cookies) => cookies.delete('inviteId'))
    } catch {}
  }

  const redirectUrl = request.nextUrl.clone()

  redirectUrl.pathname = '/'
  redirectUrl.search = ''

  return NextResponse.redirect(redirectUrl)
}
