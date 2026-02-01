import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ user: null, isAdmin: false })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const isAdmin = user.email === adminEmail

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
    },
    isAdmin,
  })
}
