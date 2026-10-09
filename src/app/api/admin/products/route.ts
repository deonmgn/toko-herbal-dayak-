import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ data: products })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil produk' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, benefits, price, weight, stock, category, image } = body
    const slug = slugify(name)
    
    const product = await prisma.product.create({
      data: {
        name, slug, description, benefits, price, weight, stock, category,
        image: image || '/images/default-product.jpg'
      }
    })
    return NextResponse.json({ data: product })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat produk' }, { status: 500 })
  }
}
