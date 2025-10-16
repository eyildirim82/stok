
import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StockMovementForm from '../components/StockMovementForm';
import { Movement, Product, MovementType } from '../types';
import { getMovements, addMovement, getProducts } from '../services/api';
import { PlusIcon } from '../components/icons/Icons';

const Movements: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [movementsData, productsData] = await Promise.all([getMovements(), getProducts()]);
      setMovements(movementsData);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (data: { productId: string; type: MovementType; quantity: number }) => {
    try {
      await addMovement(data);
      fetchData();
      handleCloseModal();
    } catch (error) {
        alert(error instanceof Error ? error.message : 'Bir hata oluştu.');
        console.error("Failed to add movement", error);
    }
  };

  const columns = [
    { header: 'Ürün Adı', accessor: (item: Movement) => item.product.name },
    { header: 'SKU', accessor: (item: Movement) => item.product.sku },
    { header: 'Tipi', accessor: (item: Movement) => (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === MovementType.IN ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {item.type}
      </span>
    )},
    { header: 'Adet', accessor: (item: Movement) => item.quantity },
    { header: 'Tarih', accessor: (item: Movement) => new Date(item.date).toLocaleString('tr-TR') },
  ];
  
  if (loading) {
    return <div className="text-center p-10">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Stok Hareketleri</h2>
        <button
          onClick={handleOpenModal}
          className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Yeni Hareket Ekle
        </button>
      </div>
      
      <DataTable columns={columns} data={movements} />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Yeni Stok Hareketi">
        {products.length > 0 ? (
            <StockMovementForm 
                products={products}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
            />
        ) : (
            <p>Stok hareketi eklemek için önce bir ürün eklemelisiniz.</p>
        )}
      </Modal>
    </div>
  );
};

export default Movements;
