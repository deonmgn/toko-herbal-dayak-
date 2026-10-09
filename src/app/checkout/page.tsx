'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../components/CartProvider';
import { formatRupiah } from '../../components/ProductCard';

export default function CheckoutPage() {
  const { cart, removeFromCart, getTotal, getTotalWeight, clearCart } = useCart();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', cityId: '', cityName: '', province: '', zipCode: '', notes: ''
  });
  
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState<{id: string, name: string, province?: string, postalCode?: string}[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  
  const [couriers, setCouriers] = useState<{courier?: string, service?: string, code?: string, name?: string, cost: number, etd: string}[]>([]);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [selectedCourierName, setSelectedCourierName] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Load Midtrans snap.js
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-xxx');
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // Debounced City Search
  useEffect(() => {
    if (citySearch.length < 2) return;
    const timer = setTimeout(async () => {
      setIsSearchingCity(true);
      try {
        const res = await fetch(`/api/shipping/cities?search=${encodeURIComponent(citySearch)}`);
        if (res.ok) {
          const json = await res.json();
          const list = json.data || json;
          setCityResults(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error('Error fetching cities:', e);
      } finally {
        setIsSearchingCity(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [citySearch]);

  const selectCity = (city: {id: string, name: string, province?: string, postalCode?: string}) => {
    setFormData(prev => ({
      ...prev,
      cityId: city.id,
      cityName: city.name,
      province: city.province || prev.province,
      zipCode: city.postalCode || prev.zipCode
    }));
    setCitySearch(city.name);
    setCityResults([]);
    fetchShippingCosts(city.id);
  };

  const fetchShippingCosts = async (cityId: string) => {
    try {
      const res = await fetch('/api/shipping/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationCityId: cityId, weight: Math.max(100, getTotalWeight()), courier: 'jne' })
      });
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json;
        if (Array.isArray(list) && list.length > 0) {
          setCouriers(list);
          const first = list[0];
          const code = first.code || `${first.courier} - ${first.service}`;
          setSelectedCourier(code);
          setSelectedCourierName(first.name || `${first.courier} ${first.service}`);
          setShippingCost(first.cost);
        }
      }
    } catch (e) {
      console.error('Error fetching shipping:', e);
    }
  };

  const handleCourierSelect = (c: any) => {
    const code = c.code || `${c.courier} - ${c.service}`;
    setSelectedCourier(code);
    setSelectedCourierName(c.name || `${c.courier} ${c.service}`);
    setShippingCost(c.cost);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.cityId || !selectedCourier) {
      alert('Mohon lengkapi data pembeli, alamat, dan pilihan kurir pengiriman.');
      return;
    }
    if (!formData.phone.startsWith('08') || formData.phone.length < 10) {
      alert('Nomor WhatsApp / HP tidak valid. Harus diawali 08 dan minimal 10 digit.');
      return;
    }

    setLoadingSubmit(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          formData,
          courier: selectedCourierName || selectedCourier,
          shippingCost
        })
      });
      
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Terjadi kesalahan saat memproses pesanan.');
        return;
      }

      const orderNumber = json.orderNumber;
      clearCart();

      // If midtrans snap popup is available and real token
      if (typeof window !== 'undefined' && (window as any).snap && json.paymentToken && !json.paymentToken.startsWith('demo-')) {
        (window as any).snap.pay(json.paymentToken, {
          onSuccess: function() { router.push(`/pesanan/${orderNumber}`); },
          onPending: function() { router.push(`/pesanan/${orderNumber}`); },
          onError: function() { alert('Pembayaran tertunda atau dibatalkan'); router.push(`/pesanan/${orderNumber}`); },
          onClose: function() { router.push(`/pesanan/${orderNumber}`); }
        });
      } else {
        router.push(`/pesanan/${orderNumber}`);
      }
    } catch (e) {
      alert('Terjadi kesalahan koneksi saat memproses pesanan.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const subtotal = getTotal();
  const total = subtotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Keranjang Belanja Kosong</h2>
        <p className="text-gray-500 mb-8">Anda belum menambahkan produk herbal apapun ke keranjang.</p>
        <button onClick={() => router.push('/')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full">
          Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout Pesanan</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Form */}
        <div className="lg:w-2/3 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Customer Info */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informasi Pembeli</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. HP (WhatsApp) *</label>
                  <input required type="tel" placeholder="08xxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Opsional)</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>
            </section>

            {/* Shipping Info */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Alamat Pengiriman</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
                  <textarea required rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Nama jalan, RT/RW, nomor rumah, patokan" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kota / Kabupaten *</label>
                    <input required type="text" value={citySearch} onChange={e => {setCitySearch(e.target.value); setFormData({...formData, cityId: ''})}} placeholder="Cari kota..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" />
                    {isSearchingCity && <div className="absolute right-3 top-9 text-xs text-gray-400">Loading...</div>}
                    
                    {cityResults.length > 0 && formData.cityId === '' && (
                      <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {cityResults.map(city => (
                          <li key={city.id} onClick={() => selectCity(city)} className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm">{city.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                    <input type="text" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                    <input type="text" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                </div>
              </div>
            </section>

            {/* Couriers */}
            {couriers.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Pilih Kurir</h2>
                <div className="space-y-3">
                  {couriers.map((c, idx) => {
                    const code = c.code || `${c.courier} - ${c.service}`;
                    const name = c.name || `${c.courier} ${c.service}`;
                    const isSelected = selectedCourier === code;
                    return (
                      <label key={code || idx} className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="courier" checked={isSelected} onChange={() => handleCourierSelect(c)} className="w-4 h-4 text-green-600 focus:ring-green-500" />
                          <div>
                            <p className="font-semibold text-gray-800">{name}</p>
                            <p className="text-sm text-gray-500">Estimasi: {c.etd}</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">{formatRupiah(c.cost)}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Catatan</h2>
              <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Pesan untuk penjual (opsional)" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"></textarea>
            </section>
            
          </form>
        </div>

        {/* Right: Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ringkasan Pesanan</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.productId} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : '🌿'}
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.quantity} x {formatRupiah(item.price)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-700 text-sm font-medium">Hapus</button>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ongkos Kirim</span>
                <span>{shippingCost > 0 ? formatRupiah(shippingCost) : '-'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-100 pt-3">
                <span>Total</span>
                <span className="text-green-700">{formatRupiah(total)}</span>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              disabled={loadingSubmit}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {loadingSubmit ? (
                <><div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> Memproses...</>
              ) : 'Bayar Sekarang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
