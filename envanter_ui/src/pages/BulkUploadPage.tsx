import React, { useState } from 'react';
import { uploadStockFile } from '../services/api';

type ImportRowError = {
  row?: number;
  field?: string;
  code?: string;
  message?: string;
};

const BulkUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<ImportRowError[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setRowErrors([]);
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
    setRowErrors([]);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadStockFile(formData);
      const processed = result.data?.processed || 0;
      setSuccess(`${processed} stok hareketi tek transaction içinde başarıyla işlendi.`);
      setFile(null);

      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      const responseData = err?.response?.data;
      setError(responseData?.message || err?.message || 'Dosya yüklenirken hata oluştu');
      setRowErrors(Array.isArray(responseData?.data?.errors) ? responseData.data.errors : []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Toplu Stok Hareketi Yükleme</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <div>{error}</div>
          {rowErrors.length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              {rowErrors.slice(0, 10).map((rowError, index) => (
                <li key={`${rowError.row || 'x'}-${rowError.field || 'x'}-${index}`}>
                  {rowError.row ? `Satır ${rowError.row}: ` : ''}{rowError.message || rowError.code || 'Geçersiz veri'}
                </li>
              ))}
              {rowErrors.length > 10 && (
                <li>...ve {rowErrors.length - 10} hata daha</li>
              )}
            </ul>
          )}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">CSV/XLSX Dosyası Yükle</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dosya Seçin
            </label>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Desteklenen formatlar: Excel (.xlsx) ve CSV (.csv). Maksimum dosya boyutu 5 MB, maksimum 1000 hareket.
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
              {loading ? 'İşleniyor...' : 'Hareketleri Yükle'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Dosya Formatı ve İşlem Kuralları</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>Her satır tek bir stok hareketidir. Şu sütunlar kullanılmalıdır:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>urunKodu:</strong> Sistemde mevcut ürün kodu (zorunlu)</li>
              <li><strong>hareketTipi:</strong> GIRIS veya CIKIS (zorunlu)</li>
              <li><strong>miktar:</strong> Pozitif tam sayı (zorunlu)</li>
              <li><strong>faturaNo:</strong> Fatura/evrak numarası (opsiyonel)</li>
              <li><strong>hareketTarihi:</strong> Tarih/saat (opsiyonel; boşsa yükleme anı)</li>
            </ul>
          </div>

          <div>
            <strong>Örnek CSV:</strong>
            <div className="bg-white p-3 rounded border mt-2 font-mono text-xs overflow-x-auto">
              urunKodu,hareketTipi,miktar,faturaNo,hareketTarihi<br/>
              ABC001,GIRIS,10,FTR-1001,2026-09-30T10:30:00Z<br/>
              DEF002,CIKIS,2,FTR-1002,2026-09-30T10:35:00Z
            </div>
          </div>

          <div className="rounded border border-blue-200 bg-white/60 p-3">
            <strong>All-or-nothing:</strong> Dosyanın herhangi bir satırı geçersizse veya bir CIKIS satırında stok yetersizse hiçbir satır uygulanmaz. Aynı dosyanın birebir yeniden yüklenmesi de çift stok hareketini önlemek için reddedilir.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadPage;
