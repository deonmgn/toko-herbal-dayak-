'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [prodRes, orderRes] = await Promise.all([
          fetch('/api/admin/products', { headers }),
          fetch('/api/admin/orders', { headers })
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const list = prodData.data || prodData.products || prodData || [];
          setProducts(Array.isArray(list) ? list : []);
        }
        
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          const list = orderData.data || orderData.orders || orderData || [];
          setOrders(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatRupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  const today = new Date().toISOString().split('T')[0];
  const ordersToday = orders.filter(o => o.createdAt.startsWith(today)).length;
  const ordersToProcess = orders.filter(o => o.status === 'paid').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = orders
    .filter(o => {
      const orderDate = new Date(o.createdAt);
      return (o.status === 'delivered' || o.status === 'shipped') &&
             orderDate.getMonth() === currentMonth &&
             orderDate.getFullYear() === currentYear;
    })
    .reduce((sum, o) => sum + o.total, 0);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      pending_payment: { label: 'Menunggu Bayar', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      paid: { label: 'Sudah Bayar', color: 'bg-green-100 text-green-800 border-green-200' },
      processing: { label: 'Diproses', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      delivered: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800 border-red-200' },
    };
    const s = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${s.color}`}>{s.label}</span>;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ringkasan Toko</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 border border-green-100 rounded-lg p-3">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Produk</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{products.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <span className="text-2xl">🛍️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pesanan Hari Ini</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{ordersToday}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-50 border border-red-100 rounded-lg p-3">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Perlu Diproses</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{ordersToProcess}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pendapatan Bulan Ini</dt>
                  <dd className="text-xl font-semibold text-gray-900">{formatRupiah(monthlyRevenue)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-100 sm:px-6 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Pesanan Terbaru</h3>
          <Link href="/admin/pesanan" className="text-sm text-green-600 hover:text-green-800 font-medium bg-green-50 px-3 py-1.5 rounded-md hover:bg-green-100 transition-colors">
            Lihat Semua &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Pesanan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatRupiah(order.total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(order.status)}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Belum ada pesanan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
