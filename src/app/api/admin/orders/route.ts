import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where = status ? { status } : {}
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ data: orders })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil pesanan' }, { status: 500 })
  }
}
