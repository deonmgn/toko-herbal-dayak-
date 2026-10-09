import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const dataToUpdate = { ...body }
    if (body.name) dataToUpdate.slug = slugify(body.name)
    
    const product = await prisma.product.update({
      where: { id: params.id },
      data: dataToUpdate
    })
    return NextResponse.json({ data: product })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.update({
      where: { id: params.id },
      data: { active: false }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 })
  }
}
