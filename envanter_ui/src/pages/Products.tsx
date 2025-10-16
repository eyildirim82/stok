import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import { Product, MovementType } from '../types';
import { getProducts, addProduct, updateProduct, deleteProduct, addMovement } from '../services/api';
import { PlusIcon, EditIcon, DeleteIcon, StockInIcon, StockOutIcon } from '../components/icons/Icons';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // State for Stock Movement Modal
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<MovementType | null>(null);
  const [movementQuantity, setMovementQuantity] = useState<number>(1);
  const [movementError, setMovementError] = useState<string>('');


  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Product Modal Handlers
  const handleOpenProductModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(false);
  };

  const handleProductSubmit = async (formData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, formData);
      } else {
        await addProduct(formData);
      }
      fetchProducts();
      handleCloseProductModal();
    } catch (error) {
      console.error("Failed to save product", error);
    }
  };
  
  const handleDelete = async (productId: string) => {
      if(window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')){
          try {
              await deleteProduct(productId);
              fetchProducts();
          } catch(error) {
              console.error("Failed to delete product", error);
          }
      }
  };

  // Stock Movement Modal Handlers
  const handleOpenStockModal = (product: Product, type: MovementType) => {
    setSelectedProductForMovement(product);
    setMovementType(type);
    setMovementQuantity(1);
    setMovementError('');
    setIsStockModalOpen(true);
  };

  const handleCloseStockModal = () => {
    setIsStockModalOpen(false);
    setSelectedProductForMovement(null);
    setMovementType(null);
  };

  const handleStockMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForMovement || !movementType) return;
    
    setMovementError('');

    if(movementType === MovementType.OUT && movementQuantity > selectedProductForMovement.quantity) {
        setMovementError(`Yetersiz stok. Mevcut: ${selectedProductForMovement.quantity}`);
        return;
    }

    try {
        await addMovement({
            productId: selectedProductForMovement.id,
            quantity: movementQuantity,
            type: movementType,
        });
        fetchProducts(); // Refetch to update quantities in the table
        handleCloseStockModal();
    } catch (error) {
        setMovementError(error instanceof Error ? error.message : 'Bir hata oluştu.');
    }
  };

  const columns = [
    { header: 'Ürün Adı', accessor: (item: Product) => item.name },
    { header: 'SKU', accessor: (item: Product) => item.sku },
    { header: 'Fiyat', accessor: (item: Product) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.price) },
    { header: 'Stok', accessor: (item: Product) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.quantity > 10 ? 'bg-green-100 text-green-800' : item.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{item.quantity}</span> },
    { header: 'İşlemler', accessor: (item: Product) => (
        <div className="flex items-center space-x-3">
            <button onClick={() => handleOpenStockModal(item, MovementType.IN)} className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200" title="Stok Girişi">
                <StockInIcon className="w-6 h-6"/>
            </button>
             <button onClick={() => handleOpenStockModal(item, MovementType.OUT)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200" title="Stok Çıkışı">
                <StockOutIcon className="w-6 h-6"/>
            </button>
            <span className="h-6 w-px bg-gray-300 dark:bg-gray-600"></span>
            <button onClick={() => handleOpenProductModal(item)} className="p-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" title="Düzenle">
                <EditIcon className="w-5 h-5"/>
            </button>
            <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Sil">
                <DeleteIcon className="w-5 h-5"/>
            </button>
        </div>
    )},
  ];

  if (loading) {
    return <div className="text-center p-10">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Ürünler</h2>
        <button
          onClick={() => handleOpenProductModal()}
          className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Yeni Ürün Ekle
        </button>
      </div>
      
      <DataTable columns={columns} data={products} />

      <Modal isOpen={isProductModalOpen} onClose={handleCloseProductModal} title={selectedProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}>
        <ProductForm 
            onSubmit={handleProductSubmit}
            onCancel={handleCloseProductModal}
            product={selectedProduct}
        />
      </Modal>

      <Modal 
        isOpen={isStockModalOpen} 
        onClose={handleCloseStockModal} 
        title={`${selectedProductForMovement?.name} - Stok ${movementType === MovementType.IN ? 'Girişi' : 'Çıkışı'} Yap`}
      >
        {selectedProductForMovement && (
            <form onSubmit={handleStockMovementSubmit} className="space-y-4">
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {movementType === MovementType.IN ? 'Giriş' : 'Çıkış'} Yapılacak Adet
                    </label>
                    <input 
                        type="number" 
                        id="quantity"
                        value={movementQuantity}
                        onChange={(e) => setMovementQuantity(parseInt(e.target.value, 10) || 1)}
                        required
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Mevcut stok: {selectedProductForMovement.quantity}</p>
                </div>
                {movementError && <p className="text-red-500 text-sm">{movementError}</p>}
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={handleCloseStockModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500">
                    İptal
                    </button>
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">
                    Kaydet
                    </button>
                </div>
            </form>
        )}
      </Modal>
    </div>
  );
};

export default Products;