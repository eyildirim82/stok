import React from 'react';
import { formatDate, formatNumber, formatCurrency } from '../utils';

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

interface StockMovementDetailModalProps {
  movement: StockMovement | null;
  isOpen: boolean;
  onClose: () => void;
}

const StockMovementDetailModal: React.FC<StockMovementDetailModalProps> = ({
  movement,
  isOpen,
  onClose
}) => {
  if (!isOpen || !movement) return null;

  const getMovementIcon = (type: string) => {
    return type === 'GIRIS' ? '📥' : '📤';
  };

  const getMovementColor = (type: string) => {
    return type === 'GIRIS' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getMovementText = (type: string) => {
    return type === 'GIRIS' ? 'Giriş' : 'Çıkış';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Stok Hareket Detayı
              </h3>
              <p className="text-gray-600">#{movement.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Hareket Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Hareket Tipi ve Miktar */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Hareket Bilgileri</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getMovementIcon(movement.movementType)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm rounded-full ${getMovementColor(movement.movementType)}`}>
                        {getMovementText(movement.movementType)}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {movement.movementType === 'GIRIS' ? '+' : '-'}{formatNumber(movement.quantity)}
                    </div>
                  </div>
                </div>
                {movement.faturaNo && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-sm text-gray-600">Fatura No:</div>
                    <div className="font-medium text-gray-900">{movement.faturaNo}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Ürün Bilgileri */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Ürün Bilgileri</h4>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-600">Ürün Kodu:</div>
                  <div className="font-medium text-gray-900">{movement.product.urunKodu}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Kategori:</div>
                  <div className="font-medium text-gray-900">{movement.product.kategori}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                  <div>
                    <div className="text-sm text-gray-600">Alış Fiyatı:</div>
                    <div className="font-medium text-gray-900">{formatCurrency(movement.product.alisFiyati)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Liste Fiyatı:</div>
                    <div className="font-medium text-gray-900">{formatCurrency(movement.product.listeFiyati)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarih Bilgileri */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Tarih Bilgileri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Hareket Tarihi:</div>
                <div className="font-medium text-gray-900">{formatDate(movement.movementDate)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Kayıt Tarihi:</div>
                <div className="font-medium text-gray-900">{formatDate(movement.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Değer Hesaplaması */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">Değer Hesaplaması</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-800">Miktar:</span>
                <span className="font-medium text-blue-900">{formatNumber(movement.quantity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Birim Fiyat (Alış):</span>
                <span className="font-medium text-blue-900">{formatCurrency(movement.product.alisFiyati)}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2">
                <span className="font-medium text-blue-900">Toplam Değer:</span>
                <span className="font-bold text-blue-900 text-lg">
                  {formatCurrency(movement.quantity * movement.product.alisFiyati)}
                </span>
              </div>
            </div>
          </div>

          {/* Kapat Butonu */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMovementDetailModal;
