
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  createdAt: string;
}

export enum MovementType {
  IN = 'Giriş',
  OUT = 'Çıkış',
}

export interface Movement {
  id: string;
  product: Product;
  type: MovementType;
  quantity: number;
  date: string;
}

export interface DashboardStats {
    totalProducts: number;
    totalStockValue: number;
    lowStockItems: number;
    outOfStockItems: number;
}

export interface ChartDataPoint {
    date: string;
    [MovementType.IN]: number;
    [MovementType.OUT]: number;
}

export interface UploadSummary {
  successCount: number;
  errorCount: number;
}
