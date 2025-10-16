import React, { useState } from 'react';
import { uploadStockFile } from '../services/api';

const BulkUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Lütfen bir dosya seçin');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadStockFile(formData);
      
      setSuccess(`Dosya başarıyla yüklendi! ${result.data?.processed || 0} kayıt işlendi.`);
      setFile(null);
      
      // File input'u temizle
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'Dosya yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Toplu Stok Yükleme</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Yükleme Formu */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Excel/CSV Dosyası Yükle</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dosya Seçin
            </label>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Desteklenen formatlar: Excel (.xlsx, .xls) ve CSV (.csv)
            </p>
          </div>

          {file && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Seçilen Dosya:</h3>
              <div className="text-sm text-gray-600">
                <div><strong>Dosya Adı:</strong> {file.name}</div>
                <div><strong>Boyut:</strong> {(file.size / 1024).toFixed(2)} KB</div>
                <div><strong>Tip:</strong> {file.type || 'Bilinmeyen'}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !file}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Yükleniyor...' : 'Dosyayı Yükle'}
            </button>
          </div>
        </form>
      </div>

      {/* Yardım Bilgileri */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Dosya Formatı Hakkında</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>Excel/CSV dosyanızda şu sütunlar bulunmalıdır:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>urunKodu:</strong> Ürün kodu (zorunlu)</li>
              <li><strong>kategori:</strong> Ürün kategorisi (zorunlu)</li>
              <li><strong>alisFiyati:</strong> Alış fiyatı (zorunlu)</li>
              <li><strong>listeFiyati:</strong> Liste fiyatı (zorunlu)</li>
              <li><strong>mevcutMiktar:</strong> Mevcut stok miktarı (opsiyonel, varsayılan: 0)</li>
            </ul>
          </div>
          <div>
            <strong>Örnek veri:</strong>
            <div className="bg-white p-3 rounded border mt-2 font-mono text-xs">
              urunKodu,kategori,alisFiyati,listeFiyati,mevcutMiktar<br/>
              ABC001,Elektronik,100.50,150.75,10<br/>
              DEF002,Giyim,25.00,35.00,5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadPage;