const path = require('node:path');
const { Readable } = require('node:stream');
const ExcelJS = require('exceljs');

const REQUIRED_HEADERS = ['urunKodu', 'hareketTipi', 'miktar'];
const OPTIONAL_HEADERS = ['faturaNo', 'hareketTarihi'];
const KNOWN_HEADERS = new Set([...REQUIRED_HEADERS, ...OPTIONAL_HEADERS]);

const canonicalHeader = (value) => {
  const normalized = String(value ?? '')
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/[\s_-]+/g, '')
    .toLocaleLowerCase('tr-TR');

  const aliases = {
    urunkodu: 'urunKodu',
    harekettipi: 'hareketTipi',
    miktar: 'miktar',
    faturano: 'faturaNo',
    harekettarihi: 'hareketTarihi',
  };

  return aliases[normalized] || null;
};

const scalarCellValue = (value) => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value;

  if (typeof value === 'object') {
    if (Object.prototype.hasOwnProperty.call(value, 'result')) {
      return scalarCellValue(value.result);
    }
    if (typeof value.text === 'string') return value.text;
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text || '').join('');
    }
  }

  return value;
};

const loadWorksheet = async (buffer, fileName) => {
  const extension = path.extname(fileName || '').toLowerCase();
  const workbook = new ExcelJS.Workbook();

  if (extension === '.xlsx') {
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error('Excel dosyasında çalışma sayfası bulunamadı');
    return worksheet;
  }

  if (extension === '.csv') {
    return workbook.csv.read(Readable.from([buffer]), {
      parserOptions: {
        ignoreEmpty: true,
        trim: true,
      },
    });
  }

  const error = new Error('Yalnızca .csv ve .xlsx dosyaları desteklenir');
  error.code = 'UNSUPPORTED_FILE_TYPE';
  throw error;
};

const parseStockImportFile = async (buffer, fileName) => {
  let worksheet;
  try {
    worksheet = await loadWorksheet(buffer, fileName);
  } catch (error) {
    if (!error.code) error.code = 'INVALID_IMPORT_FILE';
    throw error;
  }

  if (worksheet.rowCount < 1) {
    const error = new Error('Dosya boş');
    error.code = 'EMPTY_IMPORT_FILE';
    throw error;
  }

  const headerRow = worksheet.getRow(1);
  const columnMap = new Map();
  const unknownHeaders = [];

  headerRow.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
    const raw = scalarCellValue(cell.value);
    const canonical = canonicalHeader(raw);
    if (canonical) {
      if (columnMap.has(canonical)) {
        const error = new Error(`Tekrarlanan sütun: ${canonical}`);
        error.code = 'DUPLICATE_IMPORT_HEADER';
        throw error;
      }
      columnMap.set(canonical, columnNumber);
    } else if (String(raw).trim()) {
      unknownHeaders.push(String(raw).trim());
    }
  });

  const missingHeaders = REQUIRED_HEADERS.filter((header) => !columnMap.has(header));
  if (missingHeaders.length > 0) {
    const error = new Error(`Eksik zorunlu sütunlar: ${missingHeaders.join(', ')}`);
    error.code = 'MISSING_IMPORT_HEADERS';
    error.details = { missingHeaders };
    throw error;
  }

  // Unknown columns are intentionally ignored so exports can carry harmless extra context.
  const rows = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const parsed = { rowNumber };
    let hasValue = false;

    for (const header of KNOWN_HEADERS) {
      const columnNumber = columnMap.get(header);
      if (!columnNumber) continue;
      const value = scalarCellValue(row.getCell(columnNumber).value);
      parsed[header] = value;
      if (value !== '' && value !== null && value !== undefined) hasValue = true;
    }

    if (hasValue) rows.push(parsed);
  }

  if (rows.length === 0) {
    const error = new Error('Dosyada işlenecek veri satırı bulunamadı');
    error.code = 'EMPTY_IMPORT_FILE';
    throw error;
  }

  return {
    rows,
    unknownHeaders,
  };
};

module.exports = {
  parseStockImportFile,
};
