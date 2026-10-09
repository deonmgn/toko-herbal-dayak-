import { NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/shipping'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { destinationCityId, weight, courier } = body

    if (!destinationCityId || !weight || !courier) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const options = await calculateShipping(destinationCityId, weight, courier)
    return NextResponse.json({ data: options })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghitung ongkos kirim' }, { status: 500 })
  }
}
