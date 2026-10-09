'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminName, setAdminName] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const name = localStorage.getItem('adminName');
    
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (name) {
      setAdminName(name);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Produk', path: '/admin/produk', icon: '📦' },
    { name: 'Pesanan', path: '/admin/pesanan', icon: '🛒' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 bg-green-700 text-white transition-transform duration-200 ease-in-out z-30 flex flex-col shadow-lg md:shadow-none`}>
        <div className="p-5 border-b border-green-600 bg-green-800">
          <h1 className="text-xl font-bold tracking-wide">🌿 Admin Toko</h1>
          <p className="text-sm text-green-200 mt-1">Herbal Dayak</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${pathname === item.path ? 'bg-green-800 shadow-inner' : 'hover:bg-green-600'}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-green-600 bg-green-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-green-600 transition-colors text-left"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 mr-2 text-gray-600 hover:text-green-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">Panel Admin Toko Herbal Dayak</h2>
          </div>
          {adminName && (
            <div className="flex items-center bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <span className="text-sm font-medium text-green-800">Halo, Ibu {adminName}</span>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
