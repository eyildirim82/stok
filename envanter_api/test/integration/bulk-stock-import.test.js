const { before, after, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = 3212;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const JWT_SECRET = 'bulk-import-integration-secret-with-sufficient-length';
let serverProcess;
let serverOutput = '';
let authToken;

const jsonRequest = async (pathname, options = {}) => {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  return { response, body: text ? JSON.parse(text) : null };
};

const uploadFile = async (buffer, fileName, contentType) => {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: contentType }), fileName);

  const response = await fetch(`${BASE_URL}/api/stock-movements/upload-entry`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
    body: form,
  });
  const text = await response.text();
  return { response, body: text ? JSON.parse(text) : null };
};

const waitForServer = async () => {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`API process exited early. Output:\n${serverOutput}`);
    }
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) return;
    } catch {
      // still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`API did not become healthy. Output:\n${serverOutput}`);
};

const createProduct = async (urunKodu) => {
  const { response, body } = await jsonRequest('/api/products', {
    method: 'POST',
    body: JSON.stringify({
      urunKodu,
      kategori: 'Bulk Import Test',
      alisFiyati: 10,
      listeFiyati: 20,
    }),
  });
  assert.equal(response.status, 201, JSON.stringify(body));
  return body.data.product;
};

before(async () => {
  await prisma.stockMovement.deleteMany();
  await prisma.stockImport.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const apiDir = path.resolve(__dirname, '../..');
  serverProcess = spawn(process.execPath, ['index.js'], {
    cwd: apiDir,
    env: {
      ...process.env,
      PORT: String(PORT),
      JWT_SECRET,
      JWT_EXPIRES_IN: '1h',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
  serverProcess.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });
  await waitForServer();

  const { response, body } = await jsonRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: `bulk-import-${Date.now()}@example.com`,
      password: 'integration-password',
    }),
  });
  assert.equal(response.status, 201, JSON.stringify(body));
  authToken = body.data.token;
});

beforeEach(async () => {
  await prisma.stockMovement.deleteMany();
  await prisma.stockImport.deleteMany();
  await prisma.product.deleteMany();
});

after(async () => {
  if (serverProcess && serverProcess.exitCode === null) serverProcess.kill('SIGTERM');
  await prisma.stockMovement.deleteMany();
  await prisma.stockImport.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

test('CSV import applies all movements atomically and records one batch', async () => {
  const first = await createProduct('BULK-CSV-A');
  const second = await createProduct('BULK-CSV-B');
  const csv = Buffer.from([
    'urunKodu,hareketTipi,miktar,faturaNo,hareketTarihi',
    'BULK-CSV-A,GIRIS,5,FTR-1,2026-09-30T10:30:00Z',
    'BULK-CSV-B,GIRIS,3,,2026-09-30T10:31:00Z',
  ].join('\n'));

  const { response, body } = await uploadFile(csv, 'stock.csv', 'text/csv');
  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(body.data.processed, 2);

  const [firstStored, secondStored, movementCount, importCount] = await Promise.all([
    prisma.product.findUnique({ where: { id: first.id } }),
    prisma.product.findUnique({ where: { id: second.id } }),
    prisma.stockMovement.count(),
    prisma.stockImport.count(),
  ]);
  assert.equal(firstStored.mevcutMiktar, 5);
  assert.equal(secondStored.mevcutMiktar, 3);
  assert.equal(movementCount, 2);
  assert.equal(importCount, 1);
});

test('exact re-upload is rejected without duplicating movements', async () => {
  const product = await createProduct('BULK-DUP');
  const csv = Buffer.from('urunKodu,hareketTipi,miktar\nBULK-DUP,GIRIS,4\n');

  const first = await uploadFile(csv, 'duplicate.csv', 'text/csv');
  assert.equal(first.response.status, 201, JSON.stringify(first.body));

  const second = await uploadFile(csv, 'duplicate.csv', 'text/csv');
  assert.equal(second.response.status, 409, JSON.stringify(second.body));
  assert.equal(second.body.error, 'IMPORT_ALREADY_PROCESSED');

  const stored = await prisma.product.findUnique({ where: { id: product.id } });
  assert.equal(stored.mevcutMiktar, 4);
  assert.equal(await prisma.stockMovement.count({ where: { productId: product.id } }), 1);
  assert.equal(await prisma.stockImport.count(), 1);
});

test('insufficient stock rolls back every earlier row in the file', async () => {
  const inbound = await createProduct('BULK-ROLLBACK-IN');
  const outbound = await createProduct('BULK-ROLLBACK-OUT');
  const csv = Buffer.from([
    'urunKodu,hareketTipi,miktar',
    'BULK-ROLLBACK-IN,GIRIS,5',
    'BULK-ROLLBACK-OUT,CIKIS,1',
  ].join('\n'));

  const { response, body } = await uploadFile(csv, 'rollback.csv', 'text/csv');
  assert.equal(response.status, 409, JSON.stringify(body));
  assert.equal(body.error, 'IMPORT_INSUFFICIENT_STOCK');
  assert.equal(body.data.errors[0].row, 3);

  const [inboundStored, outboundStored] = await Promise.all([
    prisma.product.findUnique({ where: { id: inbound.id } }),
    prisma.product.findUnique({ where: { id: outbound.id } }),
  ]);
  assert.equal(inboundStored.mevcutMiktar, 0);
  assert.equal(outboundStored.mevcutMiktar, 0);
  assert.equal(await prisma.stockMovement.count(), 0);
  assert.equal(await prisma.stockImport.count(), 0);
});

test('validation errors reject the whole file before a transaction starts', async () => {
  await createProduct('BULK-VALID');
  const csv = Buffer.from([
    'urunKodu,hareketTipi,miktar',
    'BULK-VALID,GIRIS,2',
    'DOES-NOT-EXIST,GIRIS,3',
  ].join('\n'));

  const { response, body } = await uploadFile(csv, 'invalid.csv', 'text/csv');
  assert.equal(response.status, 422, JSON.stringify(body));
  assert.equal(body.error, 'IMPORT_VALIDATION_FAILED');
  assert.equal(body.data.errors[0].code, 'PRODUCT_NOT_FOUND');

  const stored = await prisma.product.findUnique({ where: { urunKodu: 'BULK-VALID' } });
  assert.equal(stored.mevcutMiktar, 0);
  assert.equal(await prisma.stockMovement.count(), 0);
  assert.equal(await prisma.stockImport.count(), 0);
});

test('XLSX import uses the same movement contract', async () => {
  const product = await createProduct('BULK-XLSX');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Stock');
  worksheet.addRow(['urunKodu', 'hareketTipi', 'miktar', 'faturaNo', 'hareketTarihi']);
  worksheet.addRow(['BULK-XLSX', 'GIRIS', 7, 'XLSX-1', new Date('2026-09-30T11:00:00Z')]);
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

  const { response, body } = await uploadFile(
    buffer,
    'stock.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(body.data.processed, 1);

  const stored = await prisma.product.findUnique({ where: { id: product.id } });
  assert.equal(stored.mevcutMiktar, 7);
  const movement = await prisma.stockMovement.findFirst({ where: { productId: product.id } });
  assert.equal(movement.importRow, 2);
  assert.ok(movement.importId);
});
