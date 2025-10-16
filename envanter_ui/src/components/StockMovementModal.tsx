import React, { useState } from 'react';
import { formatCurrency, formatNumber } from '../utils';

interface Product {
  id: number;
  urunKodu: string;
  kategori: string;
  alisFiyati: number;
  listeFiyati: number;
  mevcutMiktar: number;
}

interface StockMovementModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: number, movementType: string, quantity: number, faturaNo?: string) => Promise<void>;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave
}) => {
  const [movementType, setMovementType] = useState<'GIRIS' | 'CIKIS'>('GIRIS');
  const [quantity, setQuantity] = useState<number>(0);
  const [faturaNo, setFaturaNo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal açıldığında form'u sıfırla
  React.useEffect(() => {
    if (isOpen) {
      setMovementType('GIRIS');
      setQuantity(0);
      setFaturaNo('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;
    
    // Validasyon
    if (quantity <= 0) {
      setError('Miktar 0\'dan büyük olmalıdır');
      return;
    }

    if (movementType === 'CIKIS' && quantity > product.mevcutMiktar) {
      setError(`Çıkış miktarı mevcut stoktan (${formatNumber(product.mevcutMiktar)}) fazla olamaz`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(product.id, movementType, quantity, faturaNo || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Stok hareketi kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Stok Hareketi
            </h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Ürün Bilgileri */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-2">{product.urunKodu}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>Kategori: {product.kategori}</div>
              <div>Mevcut Stok: <span className="font-medium">{formatNumber(product.mevcutMiktar)}</span></div>
              <div>Alış Fiyatı: {formatCurrency(product.alisFiyati)}</div>
              <div>Liste Fiyatı: {formatCurrency(product.listeFiyati)}</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hareket Tipi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hareket Tipi *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType('GIRIS')}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                    movementType === 'GIRIS'
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📥 Giriş
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('CIKIS')}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                    movementType === 'CIKIS'
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📤 Çıkış
                </button>
              </div>
            </div>

            {/* Miktar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Miktar *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Miktar giriniz"
              />
              {movementType === 'CIKIS' && quantity > product.mevcutMiktar && (
                <p className="text-red-500 text-xs mt-1">
                  ⚠️ Çıkış miktarı mevcut stoktan fazla olamaz
                </p>
              )}
            </div>

            {/* Fatura No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fatura No (Opsiyonel)
              </label>
              <input
                type="text"
                value={faturaNo}
                onChange={(e) => setFaturaNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Fatura numarası"
              />
            </div>

            {/* Özet */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">İşlem Özeti</h5>
              <div className="text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Mevcut Stok:</span>
                  <span className="font-medium">{formatNumber(product.mevcutMiktar)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{movementType === 'GIRIS' ? 'Giriş Miktarı:' : 'Çıkış Miktarı:'}</span>
                  <span className="font-medium">{formatNumber(quantity)}</span>
                </div>
                <div className="flex justify-between font-medium text-blue-900">
                  <span>Yeni Stok:</span>
                  <span>
                    {movementType === 'GIRIS' 
                      ? formatNumber(product.mevcutMiktar + quantity)
                      : formatNumber(product.mevcutMiktar - quantity)
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            {/* Butonlar */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading || quantity <= 0 || (movementType === 'CIKIS' && quantity > product.mevcutMiktar)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kaydediliyor...
                  </span>
                ) : (
                  `${movementType === 'GIRIS' ? 'Giriş' : 'Çıkış'} Kaydet`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockMovementModal;
