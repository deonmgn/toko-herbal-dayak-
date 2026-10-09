import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug, active: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: product })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil detail produk' }, { status: 500 })
  }
}
