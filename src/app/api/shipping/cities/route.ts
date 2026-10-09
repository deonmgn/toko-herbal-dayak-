import { NextResponse } from 'next/server'
import { getCities } from '@/lib/shipping'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined

    const cities = await getCities(search)
    return NextResponse.json({ data: cities })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data kota' }, { status: 500 })
  }
}
