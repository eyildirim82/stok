const { before, after, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = 3210;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const JWT_SECRET = 'integration-test-secret-with-sufficient-length';
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

  let body = null;
  const text = await response.text();
  if (text) body = JSON.parse(text);

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

const createProduct = async (code) => {
  const { response, body } = await api('/api/products', {
    method: 'POST',
    body: JSON.stringify({
      urunKodu: code,
      kategori: 'Integration Test',
      alisFiyati: 10,
      listeFiyati: 20,
    }),
  });

  assert.equal(response.status, 201, JSON.stringify(body));
  return body.data.product;
};

const createMovement = (productId, movementType, quantity) => api('/api/stock-movements/manual', {
  method: 'POST',
  body: JSON.stringify({ productId, movementType, quantity }),
});

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
      username: `integration-${Date.now()}@example.com`,
      password: 'integration-password',
    }),
  });

  assert.equal(response.status, 201, JSON.stringify(body));
  authToken = body.data.token;
});

beforeEach(async () => {
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
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

test('GIRIS increments stock and records exactly one movement', async () => {
  const product = await createProduct('INT-GIRIS');
  const { response, body } = await createMovement(product.id, 'GIRIS', 7);

  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(body.data.movement.movementType, 'GIRIS');
  assert.equal(body.data.movement.quantity, 7);
  assert.equal(body.data.movement.product.mevcutMiktar, 7);

  const stored = await prisma.product.findUnique({ where: { id: product.id } });
  const movementCount = await prisma.stockMovement.count({ where: { productId: product.id } });
  assert.equal(stored.mevcutMiktar, 7);
  assert.equal(movementCount, 1);
});

test('CIKIS decrements stock and records exactly one movement', async () => {
  const product = await createProduct('INT-CIKIS');
  await createMovement(product.id, 'GIRIS', 10);

  const { response, body } = await createMovement(product.id, 'CIKIS', 4);
  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(body.data.movement.product.mevcutMiktar, 6);

  const stored = await prisma.product.findUnique({ where: { id: product.id } });
  const exitCount = await prisma.stockMovement.count({
    where: { productId: product.id, movementType: 'CIKIS' },
  });
  assert.equal(stored.mevcutMiktar, 6);
  assert.equal(exitCount, 1);
});

test('insufficient CIKIS returns 409 and changes nothing', async () => {
  const product = await createProduct('INT-INSUFFICIENT');
  await createMovement(product.id, 'GIRIS', 3);

  const beforeCount = await prisma.stockMovement.count({ where: { productId: product.id } });
  const { response, body } = await createMovement(product.id, 'CIKIS', 4);

  assert.equal(response.status, 409, JSON.stringify(body));
  assert.equal(body.error, 'INSUFFICIENT_STOCK');

  const stored = await prisma.product.findUnique({ where: { id: product.id } });
  const afterCount = await prisma.stockMovement.count({ where: { productId: product.id } });
  assert.equal(stored.mevcutMiktar, 3);
  assert.equal(afterCount, beforeCount);
});

test('concurrent CIKIS requests cannot overspend available stock', async () => {
  const product = await createProduct('INT-CONCURRENT');
  await createMovement(product.id, 'GIRIS', 5);

  const results = await Promise.all([
    createMovement(product.id, 'CIKIS', 4),
    createMovement(product.id, 'CIKIS', 4),
  ]);

  const statuses = results.map(({ response }) => response.status).sort();
  assert.deepEqual(statuses, [201, 409]);

  const stored = await prisma.product.findUnique({ where: { id: product.id } });
  const exitCount = await prisma.stockMovement.count({
    where: { productId: product.id, movementType: 'CIKIS' },
  });
  assert.equal(stored.mevcutMiktar, 1);
  assert.equal(exitCount, 1);
});

test('product creation cannot initialize stock without a movement', async () => {
  const { response, body } = await api('/api/products', {
    method: 'POST',
    body: JSON.stringify({
      urunKodu: 'INT-DIRECT-INITIAL-STOCK',
      kategori: 'Integration Test',
      alisFiyati: 10,
      listeFiyati: 20,
      mevcutMiktar: 5,
    }),
  });

  assert.equal(response.status, 400, JSON.stringify(body));
  assert.equal(body.error, 'STOCK_UPDATE_REQUIRES_MOVEMENT');
  assert.equal(await prisma.product.count({
    where: { urunKodu: 'INT-DIRECT-INITIAL-STOCK' },
  }), 0);
});

test('product update cannot mutate stock quantity directly', async () => {
  const product = await createProduct('INT-DIRECT-STOCK');

  const { response, body } = await api(`/api/products/${product.id}`, {
    method: 'PUT',
    body: JSON.stringify({ mevcutMiktar: 99 }),
  });

  assert.equal(response.status, 400, JSON.stringify(body));
  assert.equal(body.error, 'STOCK_UPDATE_REQUIRES_MOVEMENT');

  const stored = await prisma.product.findUnique({ where: { id: product.id } });
  assert.equal(stored.mevcutMiktar, 0);
});
