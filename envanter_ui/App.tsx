import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './src/components/Sidebar';
import Header from './src/components/Header';
import Dashboard from './src/pages/Dashboard';
import ProductPage from './src/pages/ProductPage';
import Login from './src/pages/Login';
import ProtectedRoute from './src/components/ProtectedRoute';
import BulkUploadPage from './src/pages/BulkUploadPage';
import StockInPage from './src/pages/StockInPage';
import StockOutPage from './src/pages/StockOutPage';
import HistoryPage from './src/pages/HistoryPage';
import { ApiProvider } from './src/contexts/ApiContext';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-dark-text">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={openSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-bg dark:bg-dark-bg p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/stock-in" element={<StockInPage />} />
            <Route path="/stock-out" element={<StockOutPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/bulk-upload" element={<BulkUploadPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ApiProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ApiProvider>
  );
};

export default App;
