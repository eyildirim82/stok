import React, { useState, useEffect } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getDashboardStats, getChartData } from '../services/api.ts';
import { formatCurrency, formatNumber } from '../utils';

interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  totalMovements: number;
  lowStockProducts: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, chartRes] = await Promise.all([
        getDashboardStats(),
        getChartData(),
      ]);

      setStats(statsRes.data);
      setChartData(chartRes.data);
    } catch (err: any) {
      setError(err.message || 'Dashboard verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Dashboard yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <strong>Hata:</strong> {error}
      </div>
    );
  }

  const incoming = chartData?.datasets.find((dataset) => dataset.label === 'Giriş')?.data ?? [];
  const outgoing = chartData?.datasets.find((dataset) => dataset.label === 'Çıkış')?.data ?? [];
  const chartRows = (chartData?.labels ?? []).map((label, index) => ({
    label,
    giris: incoming[index] ?? 0,
    cikis: outgoing[index] ?? 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Dashboard</h1>
          <p className="text-lg text-gray-600">Envanter yönetim sistemi genel bakış</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Ürün</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats ? formatNumber(stats.totalProducts) : '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Stok Değeri</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats ? formatCurrency(stats.totalStockValue) : '₺0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Hareket</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats ? formatNumber(stats.totalMovements) : '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Düşük Stok</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats ? formatNumber(stats.lowStockProducts) : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Son 7 Gün Stok Hareketleri</h2>
              <p className="text-sm text-gray-500 mt-1">Günlük giriş ve çıkış miktarları</p>
            </div>
          </div>
          <div className="h-72" aria-label="Son 7 gün stok hareketleri grafiği">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="giris" name="Giriş" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cikis" name="Çıkış" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/#/products" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📦</div>
              <div>
                <h3 className="font-semibold text-gray-900">Ürün Yönetimi</h3>
                <p className="text-sm text-gray-500">Ürünleri görüntüle ve yönet</p>
              </div>
            </div>
          </a>

          <a href="/#/stock-in" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📥</div>
              <div>
                <h3 className="font-semibold text-gray-900">Stok Girişi</h3>
                <p className="text-sm text-gray-500">Yeni stok girişi yap</p>
              </div>
            </div>
          </a>

          <a href="/#/stock-out" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📤</div>
              <div>
                <h3 className="font-semibold text-gray-900">Stok Çıkışı</h3>
                <p className="text-sm text-gray-500">Stok çıkışı yap</p>
              </div>
            </div>
          </a>

          <a href="/#/history" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📋</div>
              <div>
                <h3 className="font-semibold text-gray-900">Hareket Geçmişi</h3>
                <p className="text-sm text-gray-500">Tüm hareketleri görüntüle</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
