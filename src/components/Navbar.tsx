'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { getItemCount } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-bold text-xl text-green-700 flex items-center gap-2">
              <span>🌿</span> Herbal Dayak
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-gray-600 hover:text-green-700 font-medium transition-colors">Beranda</Link>
            <Link href="/#produk" className="text-gray-600 hover:text-green-700 font-medium transition-colors">Produk</Link>
            
            <Link href="/checkout" className="relative text-gray-600 hover:text-green-700 transition-colors flex items-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                  {getItemCount()}
                </span>
              )}
            </Link>
            
            <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600 ml-4 border-l pl-4">Admin</Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link href="/checkout" className="relative text-gray-600 hover:text-green-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {getItemCount()}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-green-700 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-700 hover:bg-green-50" onClick={() => setIsOpen(false)}>Beranda</Link>
            <Link href="/#produk" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-700 hover:bg-green-50" onClick={() => setIsOpen(false)}>Produk</Link>
            <Link href="/admin" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-gray-600" onClick={() => setIsOpen(false)}>Admin Portal</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
