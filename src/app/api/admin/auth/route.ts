import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const admin = await prisma.admin.findUnique({ where: { username } })
    
    if (!admin) return NextResponse.json({ error: 'Kredensial tidak valid' }, { status: 401 })
    
    const validPassword = await bcrypt.compare(password, admin.password)
    if (!validPassword) return NextResponse.json({ error: 'Kredensial tidak valid' }, { status: 401 })

    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
    return NextResponse.json({ token, username: admin.username, name: admin.name })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal login' }, { status: 500 })
  }
}
