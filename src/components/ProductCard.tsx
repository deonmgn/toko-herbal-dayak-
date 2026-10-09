'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  benefits: string;
  price: number;
  weight: number;
  stock: number;
  category: string;
  image: string;
  active: boolean;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock > 0) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        weight: product.weight,
        slug: product.slug
      });
      alert(`${product.name} ditambahkan ke keranjang`);
    }
  };

  return (
    <Link href={`/produk/${product.slug}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* Image Area */}
      <div className="relative aspect-square w-full bg-green-50 overflow-hidden">
        {!imgError && product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-green-100 text-green-600">
            <span className="text-5xl mb-2">🌿</span>
            <span className="text-sm font-medium opacity-70">Gambar Tidak Tersedia</span>
          </div>
        )}
        
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-green-800 shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-xl font-bold text-green-700 mb-3">{formatRupiah(product.price)}</p>
        
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className={`text-sm font-medium ${product.stock > 0 ? 'text-gray-500' : 'text-red-500'}`}>
            {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
          </span>
          <button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              product.stock > 0 
              ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            + Keranjang
          </button>
        </div>
      </div>
    </Link>
  );
}
