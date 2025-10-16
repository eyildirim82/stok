
import React from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, ProductIcon, LogoIcon, BulkUploadIcon, StockInIcon, StockOutIcon, CloseIcon } from './icons/Icons';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center px-4 py-3 text-black opacity-100 transition-colors duration-200 transform rounded-lg hover:bg-gray-200 hover:text-black ${
      isActive ? 'bg-gray-300 text-black font-semibold' : ''
    }`;

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={
          // mobile: slide-in drawer, desktop: static sidebar
          `fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-200 md:static md:translate-x-0 md:flex md:flex-col ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`
        }
        aria-hidden={!isOpen}
      >
      <div className="flex items-center justify-between h-20 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 px-4">
        <div className="flex items-center text-white">
            <LogoIcon className="w-8 h-8 mr-2"/>
            <span className="text-xl font-bold">Envanter</span>
        </div>
        <button
          type="button"
          className="md:hidden text-white hover:text-gray-100 p-1 rounded"
          aria-label="Menüyü kapat"
          onClick={onClose}
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/dashboard" className={navLinkClasses}>
          <DashboardIcon className="w-5 h-5" />
          <span className="mx-4">Gösterge Paneli</span>
        </NavLink>
        <NavLink to="/products" className={navLinkClasses}>
          <ProductIcon className="w-5 h-5" />
          <span className="mx-4">Ürünler</span>
        </NavLink>
        <NavLink to="/stock-in" className={navLinkClasses}>
          <StockInIcon className="w-5 h-5" />
          <span className="mx-4">Stok Girişleri</span>
        </NavLink>
        <NavLink to="/stock-out" className={navLinkClasses}>
          <StockOutIcon className="w-5 h-5" />
          <span className="mx-4">Stok Çıkışları</span>
        </NavLink>
        <NavLink to="/history" className={navLinkClasses}>
          <BulkUploadIcon className="w-5 h-5" />
          <span className="mx-4">Hareket Geçmişi</span>
        </NavLink>
        <NavLink to="/bulk-upload" className={navLinkClasses}>
          <BulkUploadIcon className="w-5 h-5" />
          <span className="mx-4">Toplu Yükleme</span>
        </NavLink>
        <NavLink to="/test" className={navLinkClasses}>
          <BulkUploadIcon className="w-5 h-5" />
          <span className="mx-4">Test</span>
        </NavLink>
        <NavLink to="/tailwind-test" className={navLinkClasses}>
          <BulkUploadIcon className="w-5 h-5" />
          <span className="mx-4">Tailwind Test</span>
        </NavLink>
        <NavLink to="/api-test" className={navLinkClasses}>
          <BulkUploadIcon className="w-5 h-5" />
          <span className="mx-4">API Test</span>
        </NavLink>
      </nav>
      </aside>
    </>
  );
};

export default Sidebar;