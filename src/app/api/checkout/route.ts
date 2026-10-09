import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePhone, generateOrderNumber } from '@/lib/utils'
import { createTransaction } from '@/lib/midtrans'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const customerName = body.customerName || body.formData?.name || ''
    const customerPhone = body.customerPhone || body.formData?.phone || ''
    const customerEmail = body.customerEmail || body.formData?.email || ''
    const address = body.address || body.formData?.address || ''
    const city = body.city || body.formData?.cityName || 'Kota Pontianak'
    const cityId = String(body.cityId || body.formData?.cityId || '365')
    const province = body.province || body.formData?.province || 'Kalimantan'
    const postalCode = body.postalCode || body.formData?.zipCode || '78111'
    const shippingCourier = body.shippingCourier || body.courier || 'JNE'
    const shippingService = body.shippingService || 'REG'
    const shippingCost = Number(body.shippingCost || 0)
    const notes = body.notes || body.formData?.notes || ''
    const items = body.items || []

    if (!customerName || !customerPhone || !address) {
      return NextResponse.json({ error: 'Data pembeli dan alamat harus diisi lengkap' }, { status: 400 })
    }
    if (!validatePhone(customerPhone)) {
      return NextResponse.json({ error: 'Format nomor telepon tidak valid. Gunakan format 08xxx.' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Keranjang belanja kosong' }, { status: 400 })
    }

    let subtotal = 0
    const orderItems = []
    const midtransItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product || !product.active) {
        return NextResponse.json({ error: `Produk tidak tersedia: ${item.productId}` }, { status: 400 })
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stok tidak cukup: ${product.name}` }, { status: 400 })
      }

      subtotal += product.price * item.quantity
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      })
      midtransItems.push({
        id: product.id,
        price: product.price,
        quantity: item.quantity,
        name: product.name
      })
    }

    midtransItems.push({
      id: 'SHIPPING',
      price: shippingCost,
      quantity: 1,
      name: `Ongkir ${shippingCourier.toUpperCase()} - ${shippingService}`
    })

    const total = subtotal + shippingCost
    const orderNumber = generateOrderNumber()

    const payment = await createTransaction({
      orderNumber,
      total,
      customerName,
      customerEmail: customerEmail || '',
      customerPhone,
      items: midtransItems
    })

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName, customerPhone, customerEmail: customerEmail || '',
        address, city, cityId, province, postalCode,
        subtotal, shippingCost, shippingCourier, shippingService, total,
        notes: notes || '', status: 'pending_payment',
        paymentUrl: payment.redirect_url,
        items: { create: orderItems }
      }
    })

    return NextResponse.json({
      orderNumber: order.orderNumber,
      paymentUrl: payment.redirect_url,
      paymentToken: payment.token
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 })
  }
}
