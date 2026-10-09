import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: params.id },
      include: {
        items: { include: { product: { select: { name: true, image: true } } } }
      }
    })

    if (!order) return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })

    return NextResponse.json({ data: order })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 })
  }
}
