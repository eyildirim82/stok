
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'red' | 'yellow';
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
    const colorClasses = {
        primary: 'bg-indigo-100 dark:bg-indigo-900 text-primary',
        secondary: 'bg-emerald-100 dark:bg-emerald-900 text-secondary',
        red: 'bg-red-100 dark:bg-red-900 text-red-500',
        yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-500',
    };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 flex items-center space-x-4">
      <div className={`rounded-full p-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default Card;
