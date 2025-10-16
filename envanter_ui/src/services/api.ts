
import { Product, Movement, MovementType, User, DashboardStats, ChartDataPoint, UploadSummary } from '../../types';

// Mock Data
let mockProducts: Product[] = [
  { id: 'prod-1', name: 'Laptop Pro', sku: 'LP-001', price: 3500, quantity: 25, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'prod-2', name: 'Kablosuz Mouse', sku: 'WM-002', price: 150, quantity: 150, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'prod-3', name: 'Mekanik Klavye', sku: 'MK-003', price: 450, quantity: 80, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'prod-4', name: '4K Monitör', sku: '4KM-004', price: 2500, quantity: 40, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'prod-5', name: 'Webcam HD', sku: 'WHD-005', price: 300, quantity: 5, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'prod-6', name: 'USB-C Hub', sku: 'UCH-006', price: 250, quantity: 0, createdAt: new Date().toISOString() },
];

let mockMovements: Movement[] = [
  { id: 'mov-1', product: mockProducts[0], type: MovementType.IN, quantity: 10, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'mov-2', product: mockProducts[1], type: MovementType.IN, quantity: 50, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'mov-3', product: mockProducts[0], type: MovementType.OUT, quantity: 5, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'mov-4', product: mockProducts[2], type: MovementType.IN, quantity: 20, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'mov-5', product: mockProducts[3], type: MovementType.OUT, quantity: 10, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'mov-6', product: mockProducts[1], type: MovementType.OUT, quantity: 20, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock API service
export const apiService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    await delay(500);
    if (email === 'admin@example.com' && password === 'password') {
      const token = 'fake-auth-token';
      localStorage.setItem('authToken', token);
      return {
        token,
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin User' },
      };
    }
    throw new Error('Geçersiz e-posta veya şifre');
  },

  logout: (): void => {
    localStorage.removeItem('authToken');
  },
};

// Functions for dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
    await delay(500);
    const totalStockValue = mockProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const lowStockItems = mockProducts.filter(p => p.quantity > 0 && p.quantity <= 10).length;
    const outOfStockItems = mockProducts.filter(p => p.quantity === 0).length;
    return {
        totalProducts: mockProducts.length,
        totalStockValue,
        lowStockItems,
        outOfStockItems
    };
};

export const getChartData = async (): Promise<ChartDataPoint[]> => {
    await delay(500);
    const data: ChartDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
        
        const dailyMovements = mockMovements.filter(m => 
            new Date(m.date).toDateString() === date.toDateString()
        );

        const totalIn = dailyMovements.filter(m => m.type === MovementType.IN).reduce((sum, m) => sum + m.quantity, 0);
        const totalOut = dailyMovements.filter(m => m.type === MovementType.OUT).reduce((sum, m) => sum + m.quantity, 0);
        
        data.push({
            date: dateString,
            [MovementType.IN]: totalIn,
            [MovementType.OUT]: totalOut
        });
    }
    return data;
};

// Functions for products
export const getProducts = async (): Promise<Product[]> => {
    await delay(300);
    return [...mockProducts];
};

export const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    await delay(300);
    const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    mockProducts.unshift(newProduct);
    return newProduct;
};

export const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> => {
    await delay(300);
    const productIndex = mockProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) throw new Error("Product not found");
    mockProducts[productIndex] = { ...mockProducts[productIndex], ...productData };
    return mockProducts[productIndex];
};

export const deleteProduct = async (productId: string): Promise<void> => {
    await delay(300);
    mockProducts = mockProducts.filter(p => p.id !== productId);
};

// Functions for movements
export const getMovements = async (): Promise<Movement[]> => {
    await delay(300);
    return [...mockMovements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addMovement = async (movementData: Omit<Movement, 'id' | 'date' | 'product'> & { productId: string }): Promise<Movement> => {
    await delay(300);
    const product = mockProducts.find(p => p.id === movementData.productId);
    if (!product) throw new Error("Product not found");

    if (movementData.type === MovementType.OUT && product.quantity < movementData.quantity) {
        throw new Error("Yetersiz stok!");
    }
    
    // Update product quantity
    product.quantity = movementData.type === MovementType.IN 
        ? product.quantity + movementData.quantity
        : product.quantity - movementData.quantity;

    const newMovement: Movement = {
        id: `mov-${Date.now()}`,
        product,
        type: movementData.type,
        quantity: movementData.quantity,
        date: new Date().toISOString(),
    };
    mockMovements.unshift(newMovement);
    return newMovement;
};

export const uploadStockFile = async (file: File): Promise<UploadSummary> => {
    await delay(1500); // Simulate network and processing time
    
    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        throw new Error('Geçersiz dosya formatı. Lütfen sadece .xlsx dosyası yükleyin.');
    }

    // In a real app, you would read the file and process rows.
    // Here, we just simulate a result.
    console.log(`Simulating upload for file: ${file.name}`);
    const successCount = Math.floor(Math.random() * (100 - 20 + 1)) + 20; // Random number between 20-100
    const errorCount = Math.floor(Math.random() * 5); // Random number between 0-4

    // Simulate adding stock based on successCount
    if (mockProducts.length > 0) {
        mockProducts[0].quantity += successCount;
    }

    return { successCount, errorCount };
};
