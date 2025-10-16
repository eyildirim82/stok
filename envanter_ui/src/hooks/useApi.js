import { useState, useCallback } from 'react';
import { apiService, errorHandler } from '../services/api';

/**
 * API istekleri için custom hook
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API isteği yap
  const makeRequest = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(...args);
      return result;
    } catch (err) {
      const handledError = errorHandler.handleApiError(err);
      setError(handledError);
      throw handledError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hata temizle
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    makeRequest,
    clearError,
  };
};

/**
 * Authentication için özel hook
 */
export const useAuth = () => {
  const { makeRequest, loading, error } = useApi();

  const login = useCallback(async (credentials) => {
    const result = await makeRequest(apiService.auth.login, credentials);
    return result;
  }, [makeRequest]);

  const register = useCallback(async (userData) => {
    const result = await makeRequest(apiService.auth.register, userData);
    return result;
  }, [makeRequest]);

  const logout = useCallback(async () => {
    const result = await makeRequest(apiService.auth.logout);
    return result;
  }, [makeRequest]);

  const getMe = useCallback(async () => {
    const result = await makeRequest(apiService.auth.getMe);
    return result;
  }, [makeRequest]);

  return {
    login,
    register,
    logout,
    getMe,
    loading,
    error,
  };
};

/**
 * Products için özel hook
 */
export const useProducts = () => {
  const { makeRequest, loading, error } = useApi();

  const getAllProducts = useCallback(async (params = {}) => {
    const result = await makeRequest(apiService.products.getAll, params);
    return result;
  }, [makeRequest]);

  const getProductById = useCallback(async (id) => {
    const result = await makeRequest(apiService.products.getById, id);
    return result;
  }, [makeRequest]);

  const createProduct = useCallback(async (productData) => {
    const result = await makeRequest(apiService.products.create, productData);
    return result;
  }, [makeRequest]);

  const updateProduct = useCallback(async (id, productData) => {
    const result = await makeRequest(apiService.products.update, id, productData);
    return result;
  }, [makeRequest]);

  const deleteProduct = useCallback(async (id) => {
    const result = await makeRequest(apiService.products.delete, id);
    return result;
  }, [makeRequest]);

  const getCategories = useCallback(async () => {
    const result = await makeRequest(apiService.products.getCategories);
    return result;
  }, [makeRequest]);

  const getStats = useCallback(async () => {
    const result = await makeRequest(apiService.products.getStats);
    return result;
  }, [makeRequest]);

  return {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    getStats,
    loading,
    error,
  };
};

/**
 * Stock Movements için özel hook
 */
export const useStockMovements = () => {
  const { makeRequest, loading, error } = useApi();

  const getAllMovements = useCallback(async (params = {}) => {
    const result = await makeRequest(apiService.stockMovements.getAll, params);
    return result;
  }, [makeRequest]);

  const createManualMovement = useCallback(async (movementData) => {
    const result = await makeRequest(apiService.stockMovements.createManual, movementData);
    return result;
  }, [makeRequest]);

  const uploadEntry = useCallback(async (fileData) => {
    const result = await makeRequest(apiService.stockMovements.uploadEntry, fileData);
    return result;
  }, [makeRequest]);

  return {
    getAllMovements,
    createManualMovement,
    uploadEntry,
    loading,
    error,
  };
};
