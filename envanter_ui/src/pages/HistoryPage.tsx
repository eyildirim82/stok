import React, { useState, useEffect } from 'react';
import { useStockMovements } from '../hooks/useApi';
import { formatDate, formatNumber, formatCurrency } from '../utils';
import StockMovementStats from '../components/StockMovementStats';
import StockMovementDetailModal from '../components/StockMovementDetailModal';

interface StockMovement {
  id: number;
  product: {
    id: number;
    urunKodu: string;
    kategori: string;
    alisFiyati: number;
    listeFiyati: number;
  };
  movementType: string;
  quantity: number;
  faturaNo?: string;
  movementDate: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const HistoryPage: React.FC = () => {
  const { getAllMovements, loading, error } = useStockMovements();
  
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Stok hareketlerini yükle
  const loadMovements = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        movementType: selectedType || undefined,
        category: selectedCategory || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy,
        sortOrder
      };
      
      const result = await getAllMovements(params);
      setMovements(result.data.movements || []);
      setPagination(result.data.pagination || pagination);
    } catch (error) {
      console.error('Stok hareketleri yüklenemedi:', error);
    }
  };

  // Component mount olduğunda hareketleri yükle
  useEffect(() => {
    loadMovements();
  }, [pagination.page, searchTerm, selectedType, selectedCategory, dateFrom, dateTo, sortBy, sortOrder]);

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

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedCategory('');
    setDateFrom('');
    setDateTo('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  // Hareket detayını göster
  const showMovementDetail = (movement: StockMovement) => {
    setSelectedMovement(movement);
    setIsDetailModalOpen(true);
  };

  // Hareket tipi ikonu
  const getMovementIcon = (type: string) => {
    return type === 'GIRIS' ? '📥' : '📤';
  };

  // Hareket tipi rengi
  const getMovementColor = (type: string) => {
    return type === 'GIRIS' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Hareket tipi metni
  const getMovementText = (type: string) => {
    return type === 'GIRIS' ? 'Giriş' : 'Çıkış';
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Stok Hareket Geçmişi</h1>
        <div className="text-sm text-gray-500">
          Toplam {formatNumber(pagination.total)} hareket
        </div>
      </div>

      {/* İstatistikler */}
      <StockMovementStats />

      {/* Filtreler */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtreler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Arama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arama
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün kodu ara..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Hareket Tipi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hareket Tipi
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="GIRIS">Giriş</option>
              <option value="CIKIS">Çıkış</option>
            </select>
          </div>

          {/* Kategori */}
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

          {/* Tarih Başlangıç */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tarih Bitiş */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Temizle Butonu */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Filtreleri Temizle
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

      {/* Stok Hareketleri Tablosu */}
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
                      onClick={() => handleSort('createdAt')}
                    >
                      Tarih {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('product.urunKodu')}
                    >
                      Ürün Kodu {sortBy === 'product.urunKodu' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('product.kategori')}
                    >
                      Kategori {sortBy === 'product.kategori' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('movementType')}
                    >
                      Tip {sortBy === 'movementType' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('quantity')}
                    >
                      Miktar {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fatura No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün Fiyatı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{formatDate(movement.movementDate)}</div>
                          <div className="text-gray-500 text-xs">
                            {formatDate(movement.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {movement.product.urunKodu}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.product.kategori}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getMovementIcon(movement.movementType)}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getMovementColor(movement.movementType)}`}>
                            {getMovementText(movement.movementType)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`font-medium ${movement.movementType === 'GIRIS' ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.movementType === 'GIRIS' ? '+' : '-'}{formatNumber(movement.quantity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.faturaNo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-xs">
                          <div>Alış: {formatCurrency(movement.product.alisFiyati)}</div>
                          <div>Liste: {formatCurrency(movement.product.listeFiyati)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => showMovementDetail(movement)}
                          className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 rounded"
                          title="Detay"
                        >
                          👁️
                        </button>
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
                      <span className="font-medium">{pagination.total}</span> hareketten{' '}
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
                      {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => {
                        const page = i + 1;
                        return (
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
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {/* Boş Durum */}
            {movements.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Stok Hareketi Bulunamadı</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedType || selectedCategory || dateFrom || dateTo
                    ? 'Arama kriterlerinize uygun hareket bulunamadı.'
                    : 'Henüz stok hareketi kaydı bulunmuyor.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hareket Detay Modal */}
      <StockMovementDetailModal
        movement={selectedMovement}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};

export default HistoryPage;
