import React, { useState, useEffect } from 'react';
import { useProducts, useStockMovements } from '../hooks/useApi';
import { formatCurrency, formatNumber } from '../utils';
import ProductDetailModal from '../components/ProductDetailModal';
import ProductStats from '../components/ProductStats';
import StockMovementModal from '../components/StockMovementModal';
import StockMovementHistory from '../components/StockMovementHistory';
import SuccessMessage from '../components/SuccessMessage';

interface Product {
  id: number;
  urunKodu: string;
  kategori: string;
  alisFiyati: number;
  listeFiyati: number;
  mevcutMiktar: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  urunKodu: string;
  kategori: string;
  alisFiyati: number;
  listeFiyati: number;
  mevcutMiktar: number;
}

const ProductPage: React.FC = () => {
  const { 
    getAllProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    loading, 
    error 
  } = useProducts();

  const { createManualMovement, loading: movementLoading } = useStockMovements();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    urunKodu: '',
    kategori: '',
    alisFiyati: 0,
    listeFiyati: 0,
    mevcutMiktar: 0
  });

  // Ürünleri yükle
  const loadProducts = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        sortBy,
        sortOrder
      };
      
      const result = await getAllProducts(params);
      setProducts(result.data.products);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    }
  };

  // Component mount olduğunda ürünleri yükle
  useEffect(() => {
    loadProducts();
  }, [pagination.page, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Form temizle
  const resetForm = () => {
    setFormData({
      urunKodu: '',
      kategori: '',
      alisFiyati: 0,
      listeFiyati: 0,
      mevcutMiktar: 0
    });
    setIsEditMode(false);
    setEditingProduct(null);
  };

  // Modal aç
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        urunKodu: product.urunKodu,
        kategori: product.kategori,
        alisFiyati: product.alisFiyati,
        listeFiyati: product.listeFiyati,
        mevcutMiktar: product.mevcutMiktar
      });
      setIsEditMode(true);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  // Modal kapat
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      
      closeModal();
      loadProducts(); // Listeyi yenile
    } catch (error) {
      console.error('Ürün kaydedilemedi:', error);
    }
  };

  // Ürün detayını göster
  const showProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  // Stok hareketi modal'ını aç
  const openStockModal = (product: Product) => {
    setStockProduct(product);
    setIsStockModalOpen(true);
  };

  // Stok hareketi kaydet
  const handleStockMovement = async (productId: number, movementType: string, quantity: number, faturaNo?: string) => {
    try {
      await createManualMovement({
        productId,
        movementType,
        quantity,
        faturaNo,
        movementDate: new Date().toISOString()
      });
      
      // Başarı mesajını göster
      setSuccessMessage(`${movementType === 'GIRIS' ? 'Stok girişi' : 'Stok çıkışı'} başarıyla kaydedildi!`);
      setShowSuccess(true);
      
      // Ürün listesini yenile
      loadProducts();
    } catch (error) {
      console.error('Stok hareketi kaydedilemedi:', error);
      throw error;
    }
  };

  // Ürün sil
  const handleDelete = async (product: Product) => {
    if (window.confirm(`${product.urunKodu} ürününü silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteProduct(product.id);
        loadProducts(); // Listeyi yenile
        setIsDetailModalOpen(false); // Detay modal'ını kapat
      } catch (error) {
        console.error('Ürün silinemedi:', error);
      }
    }
  };

  // Sayfa değiştir
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Sıralama değiştir
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Başlık ve Yeni Ekle Butonu */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📦 Ürün Yönetimi
            </h1>
            <p className="text-lg text-gray-600">
              Ürünlerinizi ekleyin, düzenleyin ve yönetin
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="btn-primary mt-4 sm:mt-0"
          >
            + Yeni Ürün Ekle
          </button>
        </div>

      {/* İstatistikler */}
      <ProductStats />

      {/* Stok Hareketi Geçmişi */}
      <StockMovementHistory limit={5} />

      {/* Filtreler ve Arama */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arama
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün kodu veya kategori ara..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Kategoriler</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Giyim">Giyim</option>
              <option value="Ev & Yaşam">Ev & Yaşam</option>
              <option value="Spor & Outdoor">Spor & Outdoor</option>
              <option value="Kitap & Medya">Kitap & Medya</option>
              <option value="Oyuncak & Hobi">Oyuncak & Hobi</option>
              <option value="Sağlık & Güzellik">Sağlık & Güzellik</option>
              <option value="Otomotiv">Otomotiv</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sıralama
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">En Yeni</option>
              <option value="createdAt-asc">En Eski</option>
              <option value="urunKodu-asc">Ürün Kodu (A-Z)</option>
              <option value="urunKodu-desc">Ürün Kodu (Z-A)</option>
              <option value="kategori-asc">Kategori (A-Z)</option>
              <option value="kategori-desc">Kategori (Z-A)</option>
              <option value="mevcutMiktar-desc">Stok (Yüksek)</option>
              <option value="mevcutMiktar-asc">Stok (Düşük)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadProducts}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Filtrele
            </button>
          </div>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Hata:</strong> {error.message}
        </div>
      )}

      {/* Ürün Tablosu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Yükleniyor...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('urunKodu')}
                    >
                      Ürün Kodu {sortBy === 'urunKodu' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('kategori')}
                    >
                      Kategori {sortBy === 'kategori' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alış Fiyatı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liste Fiyatı
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('mevcutMiktar')}
                    >
                      Stok {sortBy === 'mevcutMiktar' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                      <div className="text-xs font-normal text-gray-400 mt-1">
                        👁️ Detay 📦 Stok ✏️ Düzenle 🗑️ Sil
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.urunKodu}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.kategori}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(product.alisFiyati)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(product.listeFiyati)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.mevcutMiktar > 10 
                            ? 'bg-green-100 text-green-800' 
                            : product.mevcutMiktar > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {formatNumber(product.mevcutMiktar)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => showProductDetail(product)}
                            className="text-green-600 hover:text-green-900 text-xs px-2 py-1 rounded"
                            title="Detay"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => openStockModal(product)}
                            className="text-purple-600 hover:text-purple-900 text-xs px-2 py-1 rounded"
                            title="Stok Hareketi"
                          >
                            📦
                          </button>
                          <button
                            onClick={() => openModal(product)}
                            className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 rounded"
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-red-600 hover:text-red-900 text-xs px-2 py-1 rounded"
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sayfalama */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{pagination.total}</span> üründen{' '}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      -{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      arası gösteriliyor
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ürün Ekleme/Düzenleme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditMode ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ürün Kodu *
                  </label>
                  <input
                    type="text"
                    value={formData.urunKodu}
                    onChange={(e) => setFormData(prev => ({ ...prev, urunKodu: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData(prev => ({ ...prev, kategori: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Kategori Seçin</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Giyim">Giyim</option>
                    <option value="Ev & Yaşam">Ev & Yaşam</option>
                    <option value="Spor & Outdoor">Spor & Outdoor</option>
                    <option value="Kitap & Medya">Kitap & Medya</option>
                    <option value="Oyuncak & Hobi">Oyuncak & Hobi</option>
                    <option value="Sağlık & Güzellik">Sağlık & Güzellik</option>
                    <option value="Otomotiv">Otomotiv</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alış Fiyatı *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.alisFiyati}
                      onChange={(e) => setFormData(prev => ({ ...prev, alisFiyati: parseFloat(e.target.value) || 0 }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Liste Fiyatı *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.listeFiyati}
                      onChange={(e) => setFormData(prev => ({ ...prev, listeFiyati: parseFloat(e.target.value) || 0 }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mevcut Miktar
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.mevcutMiktar}
                    onChange={(e) => setFormData(prev => ({ ...prev, mevcutMiktar: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    {isEditMode ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Detay Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(product) => {
          setIsDetailModalOpen(false);
          openModal(product);
        }}
        onDelete={handleDelete}
      />

      {/* Stok Hareketi Modal */}
      <StockMovementModal
        product={stockProduct}
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSave={handleStockMovement}
      />

      {/* Başarı Mesajı */}
      <SuccessMessage
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
    </div>
  );
};

export default ProductPage;
