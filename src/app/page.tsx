'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ProductCard, { Product } from '../components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);

  const categories = [
    { label: 'Semua', value: 'Semua' },
    { label: 'Akar & Herbal', value: 'akar-herbal' },
    { label: 'Olahan', value: 'olahan' },
    { label: 'Minyak', value: 'minyak' },
    { label: 'Jamu', value: 'jamu' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const json = await res.json();
          setProducts(json.data || json);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = activeCategory === 'Semua' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch && p.active;
    });
  }, [products, search, activeCategory]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-800 to-green-600 text-white py-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Herbal Asli Dayak Kalimantan
          </h1>
          <p className="text-lg md:text-xl text-green-50 mb-10 max-w-2xl mx-auto">
            Obat tradisional turun-temurun dari suku Dayak, dikirim langsung ke rumah Anda. Temukan khasiat alam untuk kesehatan yang lebih baik.
          </p>
          <a href="#produk" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
            Lihat Produk
          </a>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-8 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-3xl mb-2">✅</span>
              <span className="font-semibold text-gray-700 text-sm md:text-base">100% Asli Kalimantan</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-3xl mb-2">🚚</span>
              <span className="font-semibold text-gray-700 text-sm md:text-base">Kirim ke Seluruh Indonesia</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-3xl mb-2">💳</span>
              <span className="font-semibold text-gray-700 text-sm md:text-base">Pembayaran Aman</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-3xl mb-2">📦</span>
              <span className="font-semibold text-gray-700 text-sm md:text-base">Dikemas Rapi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="produk" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Produk Herbal Kami</h2>
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.value 
                  ? 'bg-green-700 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-lg">Tidak ada produk yang ditemukan.</p>
          </div>
        )}
      </section>
    </div>
  );
}
