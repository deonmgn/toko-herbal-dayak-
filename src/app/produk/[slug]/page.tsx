'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../components/CartProvider';
import { Product, formatRupiah } from '../../../components/ProductCard';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        if (res.ok) {
          const json = await res.json();
          setProduct(json.data || json);
        } else {
          setProduct(null);
        }
      } catch (e) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Produk tidak ditemukan</h1>
        <button onClick={() => router.push('/')} className="mt-4 text-green-600 hover:underline">Kembali ke Beranda</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      weight: product.weight,
      slug: product.slug
    });
    alert(`${quantity} ${product.name} ditambahkan ke keranjang`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => router.push('/')} className="mb-6 text-gray-500 hover:text-green-700 flex items-center gap-2">
        <span>←</span> Kembali ke Produk
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        {/* Image */}
        <div className="w-full md:w-1/2 bg-green-50 aspect-square md:aspect-auto flex items-center justify-center relative">
          {!imgError && product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="text-center text-green-600 flex flex-col items-center p-10">
              <span className="text-8xl mb-4">🌿</span>
              <span className="text-lg opacity-70 font-medium">Gambar Tidak Tersedia</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold w-max mb-4">
            {product.category}
          </span>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-3xl font-extrabold text-green-700 mb-6">{formatRupiah(product.price)}</p>
          
          <div className="space-y-6 mb-8 flex-grow">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Khasiat / Manfaat</h3>
              <p className="text-gray-600 leading-relaxed bg-green-50 p-4 rounded-lg border border-green-100">
                {product.benefits}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Deskripsi Produk</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            <div className="flex gap-6 text-sm text-gray-500 border-t border-gray-100 pt-6">
              <p>Berat: <span className="font-semibold text-gray-700">{product.weight} gram</span></p>
              <p>Ketersediaan: <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{product.stock > 0 ? `${product.stock} stok` : 'Habis'}</span></p>
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center gap-4 border-t border-gray-100 pt-8 mt-auto">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                disabled={product.stock <= 0}
              >-</button>
              <span className="px-4 py-3 font-semibold w-12 text-center text-gray-800">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                disabled={product.stock <= 0}
              >+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`flex-1 py-3 px-6 rounded-lg font-bold text-white shadow-sm transition-all ${
                product.stock > 0 
                ? 'bg-green-600 hover:bg-green-700 active:scale-95 hover:shadow-md' 
                : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
