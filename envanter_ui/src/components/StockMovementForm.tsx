
import React, { useState } from 'react';
import { Product, MovementType } from '../types';

interface StockMovementFormProps {
  products: Product[];
  onSubmit: (data: { productId: string; type: MovementType; quantity: number }) => void;
  onCancel: () => void;
  defaultType?: MovementType;
}

const StockMovementForm: React.FC<StockMovementFormProps> = ({ products, onSubmit, onCancel, defaultType }) => {
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [type, setType] = useState<MovementType>(defaultType || MovementType.IN);
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const selectedProduct = products.find(p => p.id === productId);
    if (type === MovementType.OUT && selectedProduct && selectedProduct.quantity < quantity) {
      setError(`Yetersiz stok. Mevcut: ${selectedProduct.quantity}`);
      return;
    }
    
    if (!productId) {
        setError('Lütfen bir ürün seçin.');
        return;
    }

    onSubmit({ productId, type, quantity });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="product" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ürün</label>
        <select
          id="product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 p-2"
        >
          <option value="" disabled>Ürün seçin...</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name} (Stok: {p.quantity})</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hareket Tipi</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as MovementType)}
            required
            disabled={!!defaultType}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 p-2 disabled:bg-gray-100 dark:disabled:bg-slate-800"
          >
            <option value={MovementType.IN}>Stok Girişi</option>
            <option value={MovementType.OUT}>Stok Çıkışı</option>
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adet</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500">
          İptal
        </button>
        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">
          Kaydet
        </button>
      </div>
    </form>
  );
};

export default StockMovementForm;