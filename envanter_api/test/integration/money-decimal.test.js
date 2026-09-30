const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = 3211;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const JWT_SECRET = 'money-decimal-integration-secret-with-sufficient-length';
let serverProcess;
let authToken;
let serverOutput = '';

const api = async (pathname, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (authToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${pathname}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
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
      // Server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`API did not become healthy. Output:\n${serverOutput}`);
};

before(async () => {
  await prisma.stockMovement.deleteMany();
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

  serverProcess.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  serverProcess.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });

  await waitForServer();

  const { response, body } = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: `money-${Date.now()}@example.com`,
      password: 'integration-password',
    }),
  });

  assert.equal(response.status, 201, JSON.stringify(body));
  authToken = body.data.token;
});

after(async () => {
  if (serverProcess && serverProcess.exitCode === null) {
    serverProcess.kill('SIGTERM');
  }

  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

test('price columns are numeric(12,2)', async () => {
  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type, numeric_precision, numeric_scale
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Product'
      AND column_name IN ('alisFiyati', 'listeFiyati')
    ORDER BY column_name
  `;

  assert.equal(columns.length, 2);
  for (const column of columns) {
    assert.equal(column.data_type, 'numeric');
    assert.equal(column.numeric_precision, 12);
    assert.equal(column.numeric_scale, 2);
  }
});

test('API preserves numeric price contract while PostgreSQL stores exact scale', async () => {
  const { response, body } = await api('/api/products', {
    method: 'POST',
    body: JSON.stringify({
      urunKodu: 'INT-DECIMAL-PRICE',
      kategori: 'Integration Test',
      alisFiyati: 19.99,
      listeFiyati: 29.95,
      mevcutMiktar: 0,
    }),
  });

  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(body.data.product.alisFiyati, 19.99);
  assert.equal(body.data.product.listeFiyati, 29.95);
  assert.equal(typeof body.data.product.alisFiyati, 'number');
  assert.equal(typeof body.data.product.listeFiyati, 'number');

  const rows = await prisma.$queryRaw`
    SELECT "alisFiyati"::text AS "alisFiyati", "listeFiyati"::text AS "listeFiyati"
    FROM "Product"
    WHERE id = ${body.data.product.id}
  `;

  assert.equal(rows.length, 1);
  assert.equal(rows[0].alisFiyati, '19.99');
  assert.equal(rows[0].listeFiyati, '29.95');
});

test('two-decimal storage is preserved after product update', async () => {
  const created = await api('/api/products', {
    method: 'POST',
    body: JSON.stringify({
      urunKodu: 'INT-DECIMAL-UPDATE',
      kategori: 'Integration Test',
      alisFiyati: 10.01,
      listeFiyati: 20.02,
      mevcutMiktar: 0,
    }),
  });

  assert.equal(created.response.status, 201, JSON.stringify(created.body));
  const productId = created.body.data.product.id;

  const updated = await api(`/api/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({
      alisFiyati: 20.1,
      listeFiyati: 30.5,
    }),
  });

  assert.equal(updated.response.status, 200, JSON.stringify(updated.body));
  assert.equal(updated.body.data.product.alisFiyati, 20.1);
  assert.equal(updated.body.data.product.listeFiyati, 30.5);

  const rows = await prisma.$queryRaw`
    SELECT "alisFiyati"::text AS "alisFiyati", "listeFiyati"::text AS "listeFiyati"
    FROM "Product"
    WHERE id = ${productId}
  `;

  assert.equal(rows[0].alisFiyati, '20.10');
  assert.equal(rows[0].listeFiyati, '30.50');
});
