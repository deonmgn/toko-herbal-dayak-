import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Brand Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center justify-center md:justify-start gap-2">
              <span className="text-2xl">🌿</span> Toko Herbal Dayak Kalimantan
            </h3>
            <p className="text-green-100 mb-4 max-w-sm mx-auto md:mx-0">
              Obat tradisional khas suku Dayak, dikirim ke seluruh Indonesia. Warisan leluhur untuk kesehatan Anda.
            </p>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-amber-400">Hubungi Kami</h4>
            <ul className="space-y-2 text-green-100">
              <li className="flex items-center justify-center md:justify-start gap-2">
                <span>📍</span> Jl. Tjilik Riwut Km. 5, Palangka Raya, Kalimantan Tengah
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <span>📱</span> WhatsApp: 0812-3456-7890
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <span>✉️</span> info@herbaldayak.com
              </li>
            </ul>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-amber-400">Informasi</h4>
            <ul className="space-y-2 text-green-100">
              <li><a href="#" className="hover:text-white transition-colors">Cara Pemesanan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Pengiriman</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-green-800 mt-10 pt-6 text-center text-green-200 text-sm">
          <p>© {new Date().getFullYear()} Toko Herbal Dayak. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
