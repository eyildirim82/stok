import React, { useState, useEffect } from 'react';
import { useStockMovements } from '../hooks/useApi';
import { formatNumber, formatCurrency } from '../utils';

interface StockMovementStats {
  totalMovements: number;
  totalEntries: number;
  totalExits: number;
  totalEntryQuantity: number;
  totalExitQuantity: number;
  totalEntryValue: number;
  totalExitValue: number;
  categoryStats: Array<{
    kategori: string;
    _count: { id: number };
    _sum: { quantity: number };
  }>;
}

const StockMovementStats: React.FC = () => {
  const { getAllMovements, loading, error } = useStockMovements();
  const [stats, setStats] = useState<StockMovementStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Son 30 günün hareketlerini al
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await getAllMovements({
        dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
        limit: 1000 // Büyük limit ile tüm hareketleri al
      });

      const movements = result.data.movements || [];
      
      // İstatistikleri hesapla
      const totalMovements = movements.length;
      const totalEntries = movements.filter(m => m.movementType === 'GIRIS').length;
      const totalExits = movements.filter(m => m.movementType === 'CIKIS').length;
      
      const totalEntryQuantity = movements
        .filter(m => m.movementType === 'GIRIS')
        .reduce((sum, m) => sum + m.quantity, 0);
      
      const totalExitQuantity = movements
        .filter(m => m.movementType === 'CIKIS')
        .reduce((sum, m) => sum + m.quantity, 0);
      
      const totalEntryValue = movements
        .filter(m => m.movementType === 'GIRIS')
        .reduce((sum, m) => sum + (m.quantity * m.product.alisFiyati), 0);
      
      const totalExitValue = movements
        .filter(m => m.movementType === 'CIKIS')
        .reduce((sum, m) => sum + (m.quantity * m.product.alisFiyati), 0);

      // Kategori istatistikleri
      const categoryMap = new Map();
      movements.forEach(movement => {
        const category = movement.product.kategori;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { count: 0, quantity: 0 });
        }
        const stats = categoryMap.get(category);
        stats.count += 1;
        stats.quantity += movement.quantity;
      });

      const categoryStats = Array.from(categoryMap.entries()).map(([kategori, data]) => ({
        kategori,
        _count: { id: data.count },
        _sum: { quantity: data.quantity }
      }));

      setStats({
        totalMovements,
        totalEntries,
        totalExits,
        totalEntryQuantity,
        totalExitQuantity,
        totalEntryValue,
        totalExitValue,
        categoryStats
      });
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <strong>Hata:</strong> {error.message}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Genel İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Toplam Hareket</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.totalMovements)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Giriş Hareketi</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.totalEntries)}</p>
              <p className="text-xs text-gray-500">{formatNumber(stats.totalEntryQuantity)} adet</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Çıkış Hareketi</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.totalExits)}</p>
              <p className="text-xs text-gray-500">{formatNumber(stats.totalExitQuantity)} adet</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Değer</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats.totalEntryValue - stats.totalExitValue)}
              </p>
              <p className="text-xs text-gray-500">
                Giriş: {formatCurrency(stats.totalEntryValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kategori İstatistikleri */}
      {stats.categoryStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Bazında Hareketler (Son 30 Gün)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.categoryStats.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{category.kategori}</h4>
                  <span className="text-sm text-gray-500">{category._count.id} hareket</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Toplam Miktar:</span>
                  <span className="font-medium text-gray-900">{formatNumber(category._sum.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovementStats;
