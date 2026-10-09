'use client'

import React, { useEffect, useState } from 'react';

interface OrderItem {
  id: string; quantity: number; price: number; product: { name: string; image: string };
}

interface Order {
  id: string; orderNumber: string; customerName: string;
  customerPhone: string; customerEmail: string;
  address: string; city: string; province: string; postalCode: string;
  subtotal: number; shippingCost: number; shippingCourier: string;
  shippingService: string; total: number; status: string;
  paymentMethod: string; trackingNumber: string; notes: string;
  createdAt: string; updatedAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [updateStatus, setUpdateStatus] = useState('');
  const [updateResi, setUpdateResi] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async (statusFilter = 'all') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const url = statusFilter === 'all' ? '/api/admin/orders' : `/api/admin/orders?status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.data || data.orders || data || [];
        setOrders(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(filter);
  }, [filter]);

  const toggleExpand = (order: Order) => {
    if (expandedOrder === order.id) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(order.id);
      setUpdateStatus(order.status);
      setUpdateResi(order.trackingNumber || '');
    }
  };

  const handleUpdateOrder = async (orderId: string) => {
    if (updateStatus === 'shipped' && !updateResi.trim()) {
      alert('Nomor Resi harus diisi jika status diubah menjadi "Dikirim".');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin memperbarui pesanan ini?')) return;

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: updateStatus, trackingNumber: updateResi })
      });

      if (res.ok) {
        alert('Pesanan berhasil diperbarui.');
        fetchOrders(filter);
        setExpandedOrder(null);
      } else {
        alert('Gagal memperbarui pesanan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatRupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  const statusOptions = [
    { value: 'pending_payment', label: 'Menunggu Bayar', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'paid', label: 'Sudah Bayar', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'processing', label: 'Diproses', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'shipped', label: 'Dikirim', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'delivered', label: 'Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'cancelled', label: 'Dibatalkan', color: 'bg-red-100 text-red-800 border-red-200' },
  ];

  const getStatusBadge = (status: string) => {
    const s = statusOptions.find(opt => opt.value === status) || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${s.color}`}>{s.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Kelola Pesanan</h1>
        <p className="text-sm text-gray-500 mb-4">Pantau dan perbarui status pesanan pelanggan</p>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-green-700 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Semua Pesanan
          </button>
          {statusOptions.map(opt => (
            <button 
              key={opt.value}
              onClick={() => setFilter(opt.value)} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === opt.value ? 'bg-green-700 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Pesanan</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pembayaran</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                    <p className="mt-2 text-sm text-gray-500">Memuat pesanan...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Belum ada pesanan dalam kategori ini.</td></tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className={`hover:bg-gray-50 cursor-pointer transition-colors ${expandedOrder === order.id ? 'bg-green-50/30' : ''}`} onClick={() => toggleExpand(order)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{formatRupiah(order.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <button className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${expandedOrder === order.id ? 'bg-gray-200 text-gray-800' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                          {expandedOrder === order.id ? 'Tutup' : 'Lihat Detail'}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Detail */}
                    {expandedOrder === order.id && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={6} className="px-0 py-0 border-b border-gray-200 text-gray-900">
                          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Info Column */}
                            <div className="lg:col-span-2 space-y-6">
                              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-lg mb-4 text-gray-900 border-b border-gray-100 pb-2">Detail Pelanggan & Pengiriman</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500 mb-1">Nama Penerima</p>
                                    <p className="font-semibold">{order.customerName}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 mb-1">Kontak</p>
                                    <p className="font-semibold">{order.customerPhone}</p>
                                    <p className="text-gray-600">{order.customerEmail}</p>
                                  </div>
                                  <div className="md:col-span-2">
                                    <p className="text-gray-500 mb-1">Alamat Pengiriman</p>
                                    <p className="font-semibold">{order.address}</p>
                                    <p className="text-gray-600">{order.city}, {order.province} {order.postalCode}</p>
                                  </div>
                                  {order.notes && (
                                    <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                                      <p className="text-yellow-800 font-semibold mb-1">Catatan Pembeli:</p>
                                      <p className="text-yellow-700">{order.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-lg mb-4 text-gray-900 border-b border-gray-100 pb-2">Produk Dipesan</h4>
                                <ul className="divide-y divide-gray-100 mb-4">
                                  {order.items.map(item => (
                                    <li key={item.id} className="py-3 flex justify-between items-center">
                                      <div className="flex items-center">
                                        <div className="h-12 w-12 bg-gray-100 rounded border border-gray-200 overflow-hidden mr-4 flex-shrink-0">
                                          {item.product?.image ? <img src={item.product.image} className="h-full w-full object-cover"/> : <span className="flex h-full w-full items-center justify-center text-gray-400 text-xs">No img</span>}
                                        </div>
                                        <div className="text-sm">
                                          <p className="font-bold text-gray-900">{item.product?.name || 'Produk'}</p>
                                          <p className="text-gray-500">{item.quantity} x {formatRupiah(item.price)}</p>
                                        </div>
                                      </div>
                                      <span className="text-sm font-bold text-gray-900">{formatRupiah(item.quantity * item.price)}</span>
                                    </li>
                                  ))}
                                </ul>
                                
                                <div className="space-y-2 text-sm text-right text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-100">
                                  <div className="flex justify-between">
                                    <span>Subtotal Produk</span>
                                    <span className="font-medium">{formatRupiah(order.subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Ongkos Kirim ({order.shippingCourier} - {order.shippingService})</span>
                                    <span className="font-medium">{formatRupiah(order.shippingCost)}</span>
                                  </div>
                                  <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                                    <span className="font-bold text-lg text-gray-900">Total Pembayaran</span>
                                    <span className="font-bold text-lg text-green-700">{formatRupiah(order.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Update Action Column */}
                            <div>
                              <div className="bg-white p-5 rounded-lg border border-green-200 shadow-sm sticky top-6">
                                <h4 className="font-bold text-lg mb-4 text-gray-900 border-b border-gray-100 pb-2">Perbarui Status Pesanan</h4>
                                
                                <div className="space-y-5">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status Saat Ini</label>
                                    <select 
                                      value={updateStatus} 
                                      onChange={(e) => setUpdateStatus(e.target.value)}
                                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-gray-50"
                                    >
                                      {statusOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                      ))}
                                    </select>
                                  </div>

                                  {(updateStatus === 'processing' || updateStatus === 'shipped' || updateStatus === 'delivered' || order.trackingNumber) && (
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Resi Pengiriman</label>
                                      <input 
                                        type="text" 
                                        value={updateResi} 
                                        onChange={(e) => setUpdateResi(e.target.value)}
                                        placeholder="Contoh: JTL123456789"
                                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                      />
                                      {updateStatus === 'shipped' && <p className="text-xs text-red-500 mt-1.5 font-medium">* Wajib diisi saat pesanan berstatus Dikirim</p>}
                                    </div>
                                  )}

                                  <div className="pt-2">
                                    <button 
                                      onClick={() => handleUpdateOrder(order.id)}
                                      disabled={isUpdating}
                                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-green-400 shadow-sm"
                                    >
                                      {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
