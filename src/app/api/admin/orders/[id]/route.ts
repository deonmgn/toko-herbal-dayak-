import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, trackingNumber } = body
    
    const updateData: any = {}
    if (status) updateData.status = status
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    
    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData
    })
    return NextResponse.json({ data: order })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui pesanan' }, { status: 500 })
  }
}
