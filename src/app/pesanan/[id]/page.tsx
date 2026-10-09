'use client';

import React, { useState, useEffect } from 'react';
import { formatRupiah } from '../../../components/ProductCard';

export default function OrderTrackingPage({ params }: { params?: { id?: string } }) {
  const defaultSearch = params?.id || '';
  const [searchQuery, setSearchQuery] = useState(defaultSearch);
  const [orderId, setOrderId] = useState(defaultSearch);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (orderId) {
      handleSearch(orderId);
    }
  }, [orderId]);

  const handleSearch = async (query: string) => {
    if (!query) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/${query.trim()}`);
      if (res.ok) {
        const json = await res.json();
        const o = json.data || json;
        if (o && (o.id || o.orderNumber)) {
          setOrder(o);
        } else {
          setOrder(null);
        }
      } else {
        setOrder(null);
      }
    } catch (e) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string = '') => {
    const sKey = status.toLowerCase();
    const maps: Record<string, {label: string, classes: string}> = {
      pending: { label: 'Menunggu Pembayaran', classes: 'bg-yellow-100 text-yellow-800' },
      pending_payment: { label: 'Menunggu Pembayaran', classes: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Sudah Dibayar', classes: 'bg-green-100 text-green-800' },
      processing: { label: 'Sedang Diproses', classes: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'Dalam Pengiriman', classes: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Pesanan Selesai', classes: 'bg-green-600 text-white' },
      cancelled: { label: 'Dibatalkan', classes: 'bg-red-100 text-red-800' },
    };
    const s = maps[sKey] || { label: status || 'Menunggu', classes: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.classes}`}>{s.label}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[60vh]">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lacak Pesanan</h1>
        <p className="text-gray-600">Cek status pesanan herbal Anda secara real-time</p>
      </div>

      {/* Search Box */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 max-w-2xl mx-auto flex gap-2">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Masukkan Nomor Pesanan (Contoh: ORD-20261009-XXXX)" 
          className="flex-grow px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && setOrderId(searchQuery)}
        />
        <button 
          onClick={() => setOrderId(searchQuery)}
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Cari
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      )}

      {/* Results */}
      {!loading && searched && !order && (
        <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
          <span className="text-4xl mb-4 block">🔍</span>
          <h3 className="text-xl font-semibold text-red-800">Pesanan tidak ditemukan</h3>
          <p className="text-red-600 mt-2">Pastikan nomor pesanan yang Anda masukkan sudah benar.</p>
        </div>
      )}

      {!loading && order && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-50 border-b border-green-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-green-800 font-medium mb-1">Nomor Pesanan</p>
              <h2 className="text-2xl font-bold text-gray-900">{order.orderNumber || order.id}</h2>
              <p className="text-xs text-gray-500 mt-1">
                {order.createdAt || order.date ? new Date(order.createdAt || order.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-'}
              </p>
            </div>
            <div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Informasi Pelanggan</h3>
                <p className="font-semibold text-gray-800">{order.customerName}</p>
                <p className="text-gray-600">{order.customerPhone}</p>
                {order.customerEmail && <p className="text-gray-500 text-sm">{order.customerEmail}</p>}
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Informasi Pengiriman</h3>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {order.address ? `${order.address}, ${order.city || ''}, ${order.province || ''} ${order.postalCode || ''}` : order.shippingAddress}
                </p>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-700">
                    Kurir: {order.shippingCourier ? `${order.shippingCourier} (${order.shippingService || 'REG'})` : (order.courier || '-')}
                  </p>
                  {order.trackingNumber ? (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Nomor Resi:</p>
                      <p className="font-bold text-green-700 text-lg tracking-wider">{order.trackingNumber}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 mt-1">Resi akan muncul setelah paket dikirim oleh penjual.</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Rincian Belanja</h3>
              <div className="space-y-3 mb-6">
                {(order.items || []).map((item: any, idx: number) => {
                  const name = item.product?.name || item.name || 'Produk Herbal';
                  return (
                    <div key={idx} className="flex justify-between items-start border-b border-gray-50 pb-3">
                      <div>
                        <p className="font-medium text-gray-800">{name}</p>
                        <p className="text-sm text-gray-500">{item.quantity} x {formatRupiah(item.price)}</p>
                      </div>
                      <p className="font-semibold text-gray-700">{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatRupiah(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ongkos Kirim</span>
                  <span>{formatRupiah(order.shippingCost || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                  <span>Total Bayar</span>
                  <span className="text-green-700">{formatRupiah(order.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
