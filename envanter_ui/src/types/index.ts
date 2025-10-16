// TypeScript tip tanımları

export interface User {
  id: number;
  username: string;
  createdAt: string;
}

export interface Product {
  id: number;
  urunKodu: string;
  kategori: string;
  alisFiyati: number;
  listeFiyati: number;
  mevcutMiktar: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  product: Product;
  movementType: 'GIRIS' | 'CIKIS';
  quantity: number;
  faturaNo?: string;
  movementDate: string;
  createdAt: string;
}

export interface ProductFormData {
  urunKodu: string;
  kategori: string;
  alisFiyati: number;
  listeFiyati: number;
  mevcutMiktar: number;
}

export interface StockMovementFormData {
  productId: number;
  movementType: 'GIRIS' | 'CIKIS';
  quantity: number;
  faturaNo?: string;
  movementDate: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface ApiError {
  type: string;
  message: string;
  code?: string;
  errors?: string[];
}
