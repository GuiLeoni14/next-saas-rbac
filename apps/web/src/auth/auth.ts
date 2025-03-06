import { cookies } from 'next/headers'

export async function isAuthenticated() {
  return await cookies().then((cookies) => {
    return !!cookies.get('token')?.value
  })
}
