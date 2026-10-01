import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const API_URL = 'http://127.0.0.1:3001';
const UI_URL = 'http://127.0.0.1:3000';
const SCREENSHOT_DIR = '../docs/screenshots';
const username = 'portfolio-demo';
const password = 'portfolio-demo-2026';

async function api(path, { method = 'GET', data, token } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(data ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${method} ${path} failed (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

const daysAgoIso = (days, hour = 10) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
};

async function seedDemoData() {
  const registration = await api('/api/auth/register', {
    method: 'POST',
    data: { username, password },
  });
  const token = registration.data.token;

  const productSpecs = [
    { urunKodu: 'SNS-IND-001', kategori: 'Elektronik', alisFiyati: 640.5, listeFiyati: 890.0 },
    { urunKodu: 'SSR-75A-DC', kategori: 'Elektronik', alisFiyati: 450.75, listeFiyati: 625.0 },
    { urunKodu: 'FLOW-DN25', kategori: 'Diğer', alisFiyati: 3150.0, listeFiyati: 4200.0 },
    { urunKodu: 'ENC-1024', kategori: 'Elektronik', alisFiyati: 980.0, listeFiyati: 1350.0 },
    { urunKodu: 'DRV-01-3P', kategori: 'Otomotiv', alisFiyati: 1750.0, listeFiyati: 2290.0 },
    { urunKodu: 'PWR-24V-10A', kategori: 'Elektronik', alisFiyati: 720.0, listeFiyati: 995.0 },
  ];

  const products = [];
  for (const spec of productSpecs) {
    const created = await api('/api/products', {
      method: 'POST',
      token,
      data: spec,
    });
    products.push(created.data.product);
  }

  const movements = [
    [products[0].id, 'GIRIS', 48, 6, 'GRS-1001'],
    [products[0].id, 'CIKIS', 9, 4, 'CKS-2001'],
    [products[1].id, 'GIRIS', 32, 5, 'GRS-1002'],
    [products[1].id, 'CIKIS', 6, 2, 'CKS-2002'],
    [products[2].id, 'GIRIS', 14, 4, 'GRS-1003'],
    [products[2].id, 'CIKIS', 5, 1, 'CKS-2003'],
    [products[3].id, 'GIRIS', 24, 3, 'GRS-1004'],
    [products[3].id, 'CIKIS', 4, 0, 'CKS-2004'],
    [products[4].id, 'GIRIS', 18, 2, 'GRS-1005'],
    [products[4].id, 'CIKIS', 8, 0, 'CKS-2005'],
    [products[5].id, 'GIRIS', 7, 1, 'GRS-1006'],
    [products[5].id, 'CIKIS', 3, 0, 'CKS-2006'],
  ];

  for (const [productId, movementType, quantity, daysAgo, faturaNo] of movements) {
    await api('/api/stock-movements/manual', {
      method: 'POST',
      token,
      data: {
        productId,
        movementType,
        quantity,
        faturaNo,
        movementDate: daysAgoIso(daysAgo, movementType === 'GIRIS' ? 10 : 15),
      },
    });
  }
}

async function capture() {
  await seedDemoData();
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto(`${UI_URL}/#/login`, { waitUntil: 'networkidle' });
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Giriş Yap' }).click();
  await page.waitForURL(/#\/dashboard$/);
  await page.getByText('Son 7 Gün Stok Hareketleri').waitFor();
  await page.locator('[aria-label="Son 7 gün stok hareketleri grafiği"] svg').waitFor();
  await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard.png`, fullPage: true });

  await page.goto(`${UI_URL}/#/products`, { waitUntil: 'networkidle' });
  await page.getByText('Ürün Yönetimi').waitFor();
  await page.getByText('SNS-IND-001', { exact: true }).first().waitFor();
  await page.screenshot({ path: `${SCREENSHOT_DIR}/products.png`, fullPage: true });

  await page.goto(`${UI_URL}/#/history`, { waitUntil: 'networkidle' });
  await page.getByText('SNS-IND-001', { exact: true }).first().waitFor();
  await page.screenshot({ path: `${SCREENSHOT_DIR}/history.png`, fullPage: true });

  await browser.close();
}

capture().catch((error) => {
  console.error(error);
  process.exit(1);
});
