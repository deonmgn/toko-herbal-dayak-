const midtransClient = require('midtrans-client');
import crypto from 'crypto';

// Inisialisasi Snap client
export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

export async function createTransaction(order: {
  orderNumber: string,
  total: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  items: any[]
}) {
  const isKeyConfigured = process.env.MIDTRANS_SERVER_KEY && 
    process.env.MIDTRANS_SERVER_KEY !== 'your_midtrans_server_key';

  if (!isKeyConfigured) {
    return {
      token: `demo-snap-token-${Date.now()}`,
      redirect_url: `/pesanan/${order.orderNumber}`
    };
  }

  try {
    const parameter = {
      transaction_details: {
        order_id: order.orderNumber,
        gross_amount: order.total
      },
      customer_details: {
        first_name: order.customerName,
        email: order.customerEmail || 'customer@tokoherbal.com',
        phone: order.customerPhone
      },
      item_details: order.items
    };

    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url
    };
  } catch (err) {
    console.warn('Midtrans API call failed, using fallback:', err);
    return {
      token: `demo-snap-token-${Date.now()}`,
      redirect_url: `/pesanan/${order.orderNumber}`
    };
  }
}

export function verifySignature(
  signatureKey: string,
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string
): boolean {
  const hash = crypto.createHash('sha512');
  const payload = orderId + statusCode + grossAmount + serverKey;
  hash.update(payload);
  const expected = hash.digest('hex');
  return signatureKey === expected;
}
