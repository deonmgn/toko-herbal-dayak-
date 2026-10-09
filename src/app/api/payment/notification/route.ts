import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySignature } from '@/lib/midtrans'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      order_id, status_code, gross_amount, signature_key,
      transaction_status, payment_type, transaction_id
    } = body

    const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    const isValid = verifySignature(signature_key, order_id, status_code, gross_amount, serverKey)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    let orderStatus = 'pending_payment'
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      orderStatus = 'paid'
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      orderStatus = 'cancelled'
    }

    await prisma.order.update({
      where: { orderNumber: order_id },
      data: { status: orderStatus, paymentMethod: payment_type, paymentId: transaction_id }
    })

    if (orderStatus === 'paid') {
      const order = await prisma.order.findUnique({
        where: { orderNumber: order_id },
        include: { items: true }
      })
      if (order) {
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memproses notifikasi' }, { status: 500 })
  }
}
