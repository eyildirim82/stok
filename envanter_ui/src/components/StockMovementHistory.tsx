import React, { useState, useEffect } from 'react';
import { useStockMovements } from '../hooks/useApi';
import { formatDate, formatNumber } from '../utils';

interface StockMovement {
  id: number;
  product: {
    id: number;
    urunKodu: string;
    kategori: string;
  };
  movementType: string;
  quantity: number;
  faturaNo?: string;
  movementDate: string;
  createdAt: string;
}

interface StockMovementHistoryProps {
  productId?: number;
  limit?: number;
}

const StockMovementHistory: React.FC<StockMovementHistoryProps> = ({ 
  productId, 
  limit = 10 
}) => {
  const { getAllMovements, loading, error } = useStockMovements();
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    loadMovements();
  }, [productId, limit]);

  const loadMovements = async () => {
    try {
      const params: any = { limit };
      if (productId) {
        params.productId = productId;
      }
      
      const result = await getAllMovements(params);
      setMovements(result.data.movements || []);
    } catch (error) {
      console.error('Stok hareketleri yüklenemedi:', error);
    }
  };

  const getMovementIcon = (type: string) => {
    return type === 'GIRIS' ? '📥' : '📤';
  };

  const getMovementColor = (type: string) => {
    return type === 'GIRIS' 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Son Stok Hareketleri
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {movements.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <p>Henüz stok hareketi bulunmuyor</p>
          </div>
        ) : (
          movements.map((movement) => (
            <div key={movement.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getMovementIcon(movement.movementType)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {movement.product.urunKodu}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getMovementColor(movement.movementType)}`}>
                        {movement.movementType === 'GIRIS' ? 'Giriş' : 'Çıkış'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {movement.product.kategori}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {movement.movementType === 'GIRIS' ? '+' : '-'}{formatNumber(movement.quantity)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(movement.movementDate)}
                  </div>
                  {movement.faturaNo && (
                    <div className="text-xs text-gray-400">
                      Fatura: {movement.faturaNo}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {movements.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 text-center">
          <button 
            onClick={loadMovements}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            🔄 Yenile
          </button>
        </div>
      )}
    </div>
  );
};

export default StockMovementHistory;
