'use client'

import { useEffect, useState } from 'react';

interface Product {
  id: string; name: string; slug: string; description: string;
  benefits: string; price: number; weight: number; stock: number;
  category: string; image: string; active: boolean;
  createdAt: string; updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '', description: '', benefits: '', price: 0, weight: 0, 
    stock: 0, category: 'akar-herbal', image: '', active: true
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.data || data.products || data || [];
        setProducts(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, description: product.description, benefits: product.benefits,
        price: product.price, weight: product.weight, stock: product.stock,
        category: product.category, image: product.image, active: product.active
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', description: '', benefits: '', price: 0, weight: 0, 
        stock: 0, category: 'akar-herbal', image: '', active: true
      });
    }
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('adminToken');
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: `Produk berhasil ${editingProduct ? 'diperbarui' : 'ditambahkan'}.` });
        fetchProducts();
        setTimeout(() => setIsModalOpen(false), 1500);
      } else {
        setMessage({ type: 'error', text: 'Gagal menyimpan produk.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Gagal menghapus produk.');
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    }
  };

  const formatRupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola inventaris dan detail produk toko Anda</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Tambah Produk
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info Produk</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                    <p className="mt-2 text-sm text-gray-500">Memuat produk...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Belum ada produk. Silakan tambah produk baru.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-gray-400 text-xs">No img</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{product.weight} gram</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {product.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatRupiah(product.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${product.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {product.active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(product)} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors mr-2">Edit</button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={() => !isSaving && setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                    <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                      {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                    </h3>
                    <button type="button" onClick={() => !isSaving && setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  
                  {message && (
                    <div className={`p-4 mb-5 rounded-md border-l-4 ${message.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                      <p className="text-sm font-medium">{message.text}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-2 text-gray-900">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow" placeholder="Masukkan nama produk..." />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                      <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow" placeholder="Jelaskan tentang produk ini..." />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Khasiat / Manfaat</label>
                      <textarea required rows={2} value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow" placeholder="Sebutkan khasiat produk..." />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white transition-shadow">
                        <option value="akar-herbal">Akar Herbal</option>
                        <option value="olahan">Olahan</option>
                        <option value="minyak">Minyak</option>
                        <option value="jamu">Jamu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">Rp</span>
                        </div>
                        <input type="number" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} className="block w-full pl-9 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Berat (gram)</label>
                      <div className="relative rounded-md shadow-sm">
                        <input type="number" required min="1" value={formData.weight} onChange={e => setFormData({...formData, weight: parseInt(e.target.value) || 0})} className="block w-full pr-12 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow" />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">g</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                      <input type="number" required min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                      <input type="url" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow" placeholder="https://..." />
                    </div>

                    <div className="sm:col-span-2 pt-2 pb-2">
                      <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <input id="active" type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer" />
                        <label htmlFor="active" className="ml-3 block text-sm font-medium text-gray-900 cursor-pointer select-none">
                          Produk Aktif (Tampil di Etalase Toko)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                  <button type="submit" disabled={isSaving} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2.5 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:bg-green-400">
                    {isSaving ? 'Menyimpan...' : 'Simpan Produk'}
                  </button>
                  <button type="button" disabled={isSaving} onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
