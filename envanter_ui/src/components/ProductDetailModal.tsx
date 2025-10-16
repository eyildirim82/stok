import React from 'react';
import { formatCurrency, formatNumber, formatDate } from '../utils';

interface Product {
  id: number;
  urunKodu: string;
  kategori: string;
  alisFiyati: number;
  listeFiyati: number;
  mevcutMiktar: number;
  createdAt: string;
  updatedAt: string;
  stockMovements?: Array<{
    id: number;
    movementType: string;
    quantity: number;
    faturaNo?: string;
    movementDate: string;
    createdAt: string;
  }>;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !product) return null;

  const getStockStatus = (quantity: number) => {
    if (quantity > 10) return { text: 'Yeterli', color: 'text-green-600 bg-green-100' };
    if (quantity > 0) return { text: 'Az', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'Tükendi', color: 'text-red-600 bg-red-100' };
  };

  const stockStatus = getStockStatus(product.mevcutMiktar);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{product.urunKodu}</h3>
              <p className="text-gray-600">{product.kategori}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(product)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Düzenle
              </button>
              <button
                onClick={() => onDelete(product)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Sil
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Fiyat Bilgileri */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Fiyat Bilgileri</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Alış Fiyatı:</span>
                  <span className="font-medium">{formatCurrency(product.alisFiyati)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Liste Fiyatı:</span>
                  <span className="font-medium">{formatCurrency(product.listeFiyati)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kar Marjı:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(product.listeFiyati - product.alisFiyati)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kar Oranı:</span>
                  <span className="font-medium text-green-600">
                    {(((product.listeFiyati - product.alisFiyati) / product.alisFiyati) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Stok Bilgileri */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Stok Bilgileri</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mevcut Miktar:</span>
                  <span className="font-medium">{formatNumber(product.mevcutMiktar)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stok Durumu:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Değer:</span>
                  <span className="font-medium">{formatCurrency(product.mevcutMiktar * product.alisFiyati)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarih Bilgileri */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Tarih Bilgileri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Oluşturulma:</span>
                <span className="ml-2 font-medium">{formatDate(product.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-600">Son Güncelleme:</span>
                <span className="ml-2 font-medium">{formatDate(product.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Son Stok Hareketleri */}
          {product.stockMovements && product.stockMovements.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Son Stok Hareketleri</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Tarih
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Tip
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Miktar
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Fatura No
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.stockMovements.slice(0, 5).map((movement) => (
                      <tr key={movement.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatDate(movement.movementDate)}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            movement.movementType === 'GIRIS' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {movement.movementType === 'GIRIS' ? 'Giriş' : 'Çıkış'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatNumber(movement.quantity)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {movement.faturaNo || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
