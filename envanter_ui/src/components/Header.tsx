import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogoutIcon, MenuIcon } from './icons/Icons';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white shadow-md border-b border-gray-200">
      <div className="flex items-center space-x-3 md:space-x-4">
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-700 hover:bg-gray-100 border border-gray-200"
          aria-label="Menüyü aç"
          onClick={onMenuClick}
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">Yönetim Paneli</h1>
      </div>
      <button
        onClick={logout}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200 transform rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700"
        aria-label="Çıkış Yap"
      >
        <LogoutIcon className="w-5 h-5 mr-2" />
        <span>Çıkış Yap</span>
      </button>
    </header>
  );
};

export default Header;