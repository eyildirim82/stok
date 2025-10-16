import React, { useState, useEffect } from 'react';
import { getMovements, addMovement, getProducts } from '../services/api';
import { formatDate, formatNumber } from '../utils';
import { Product, StockMovement } from '../types';

const StockInPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [faturaNo, setFaturaNo] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [movementsRes, productsRes] = await Promise.all([
        getMovements({ movementType: 'GIRIS' }),
        getProducts()
      ]);
      
      setMovements(movementsRes.data.movements || []);
      setProducts((productsRes.data && productsRes.data.products) || []);
    } catch (err: any) {
      setError(err.message || 'Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || quantity <= 0) {
      setError('Lütfen ürün seçin ve geçerli bir miktar girin');
      return;
    }

    setLoading(true);
    try {
      await addMovement({
        productId: selectedProduct,
        movementType: 'GIRIS',
        quantity,
        faturaNo: faturaNo || undefined,
        movementDate: new Date().toISOString()
      });
      
      // Form'u temizle
      setSelectedProduct(null);
      setQuantity(0);
      setFaturaNo('');
      setError(null);
      
      // Verileri yenile
      loadData();
    } catch (err: any) {
      setError(err.message || 'Stok girişi kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Stok Girişleri</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stok Giriş Formu */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Yeni Stok Girişi</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Seçin
              </label>
              <select
                value={selectedProduct || ''}
                onChange={(e) => setSelectedProduct(parseInt(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Ürün seçin...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.urunKodu} - {product.kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Miktar
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fatura No (Opsiyonel)
              </label>
              <input
                type="text"
                value={faturaNo}
                onChange={(e) => setFaturaNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Stok Girişi Yap'}
            </button>
          </div>
        </form>
      </div>

      {/* Stok Girişleri Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Son Stok Girişleri</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Yükleniyor...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miktar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fatura No
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(movement.movementDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{movement.product.urunKodu}</div>
                        <div className="text-gray-500">{movement.product.kategori}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="text-green-600 font-medium">
                        +{formatNumber(movement.quantity)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.faturaNo || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {movements.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Stok Girişi Yok</h3>
            <p className="text-gray-500">İlk stok girişinizi yapmak için yukarıdaki formu kullanın.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockInPage;