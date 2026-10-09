export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export function generateOrderNumber(): string {
  const date = new Date()
  const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${dateString}-${randomChars}`
}

export function validatePhone(phone: string): boolean {
  const regex = /^(08|\+62)\d{8,13}$/
  return regex.test(phone)
}

export function validatePostalCode(code: string): boolean {
  return /^\d{5}$/.test(code)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
}
