import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Admin Toko',
    },
  })

  const products = [
    {
      slug: 'akar-pasak-bumi',
      name: 'Akar Pasak Bumi (Tongkat Ali)',
      price: 75000,
      weight: 100,
      description: 'Herbal tradisional untuk meningkatkan stamina dan vitalitas pria secara alami.',
      benefits: 'Stamina & vitalitas',
      category: 'akar-herbal',
      stock: 100,
      image: '/images/produk-1.svg'
    },
    {
      slug: 'sarang-semut-papua',
      name: 'Sarang Semut Papua',
      price: 85000,
      weight: 50,
      description: 'Herbal langka Papua yang kaya antioksidan.',
      benefits: 'Antioksidan & anti-tumor',
      category: 'akar-herbal',
      stock: 75,
      image: '/images/produk-2.svg'
    },
    {
      slug: 'kratom-kalimantan',
      name: 'Kratom Kalimantan',
      price: 60000,
      weight: 100,
      description: 'Daun Kratom kualitas super untuk pengobatan tradisional.',
      benefits: 'Pereda nyeri alami',
      category: 'akar-herbal',
      stock: 50,
      image: '/images/produk-3.svg'
    },
    {
      slug: 'minyak-ulin-dayak',
      name: 'Minyak Ulin Dayak',
      price: 45000,
      weight: 100,
      description: 'Minyak pijat dengan ekstrak ulin, meresap cepat ke kulit.',
      benefits: 'Minyak pijat tradisional',
      category: 'minyak',
      stock: 60,
      image: '/images/produk-4.svg'
    },
    {
      slug: 'kayu-bajakah',
      name: 'Kayu Bajakah',
      price: 95000,
      weight: 100,
      description: 'Potongan akar Bajakah asli yang berkhasiat tinggi.',
      benefits: 'Herbal anti-kanker',
      category: 'akar-herbal',
      stock: 80,
      image: '/images/produk-5.svg'
    },
    {
      slug: 'jamu-ramu-dayak',
      name: 'Jamu Ramu Dayak (racikan)',
      price: 50000,
      weight: 200,
      description: 'Racikan jamu tradisional turun-temurun untuk kebugaran.',
      benefits: 'Jamu peningkat imun',
      category: 'jamu',
      stock: 100,
      image: '/images/produk-6.svg'
    }
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    })
  }
  
  console.log('Seed berhasil ditambahkan.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
