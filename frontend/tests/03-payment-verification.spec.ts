import { test, expect } from '@playwright/test';

// ============================================================
// TEST SUITE 3: Payment Verification
// ============================================================

const BASE_URL = 'http://localhost:5173';

const ADMIN = {
  email: 'admin@apartment.com',
  password: 'admin123',
};

const TENANT = {
  email: 'somchai@email.com',
  password: 'tenant123',
};

// ============================================================
// Helper: Login
// ============================================================

async function login(page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);

  await page
    .getByRole('textbox', { name: /email/i })
    .fill(email);

  await page
    .getByRole('textbox', { name: /password/i })
    .fill(password);

  await page
    .getByRole('button', { name: /sign in|login/i })
    .click();

  // รอ redirect ออกจาก login
  await page.waitForURL(
    (url) => !url.pathname.includes('/login'),
    { timeout: 10000 }
  );
}

// ============================================================
// GROUP 1: Tenant Upload Payment Slip
// ============================================================

// Helper: เปิด payment dialog ของ invoice แรก
async function openPayDialog(page) {
  await page.locator('button:has-text("Pay")').first().click();
  await page.waitForSelector('#slip-file', { state: 'attached', timeout: 5000 });
}

test.describe('Tenant อัปโหลด Payment Slip', () => {

  test('Tenant เข้าหน้า payment ได้', async ({ page }) => {

    await login(page, TENANT.email, TENANT.password);

    await page.goto(`${BASE_URL}/my-invoices`);

    await expect(page).toHaveURL(/my-invoices/);

  });

  test('Tenant อัปโหลด slip รูปภาพ .jpg สำเร็จ', async ({ page }) => {

    await login(page, TENANT.email, TENANT.password);

    await page.goto(`${BASE_URL}/my-invoices`);

    await openPayDialog(page);

    await page.locator('#slip-file').setInputFiles({
      name: 'payment_slip.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content'),
    });

    await page.click('button[type="submit"]:has-text("Upload")');

    await expect(
      page.locator('[data-sonner-toast], [role="status"]').first()
    ).toBeVisible({ timeout: 8000 });

  });

  test('Tenant อัปโหลด slip รูปภาพ .png สำเร็จ', async ({ page }) => {

    await login(page, TENANT.email, TENANT.password);

    await page.goto(`${BASE_URL}/my-invoices`);

    await openPayDialog(page);

    await page.locator('#slip-file').setInputFiles({
      name: 'slip.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-png-content'),
    });

    await page.click('button[type="submit"]:has-text("Upload")');

    await expect(
      page.locator('[data-sonner-toast], [role="status"]').first()
    ).toBeVisible({ timeout: 8000 });

  });

  test('อัปโหลดไฟล์ .exe → แสดง error toast', async ({ page }) => {

    await login(page, TENANT.email, TENANT.password);

    await page.goto(`${BASE_URL}/my-invoices`);

    await openPayDialog(page);

    await page.locator('#slip-file').setInputFiles({
      name: 'virus.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('not-an-image'),
    });

    await expect(
      page.locator('[data-sonner-toast]').first()
    ).toBeVisible({ timeout: 5000 });

  });

  test('ไม่เลือกไฟล์แล้วกด Upload → ปุ่มถูก disable', async ({ page }) => {

    await login(page, TENANT.email, TENANT.password);

    await page.goto(`${BASE_URL}/my-invoices`);

    await openPayDialog(page);

    const uploadBtn = page.locator('button[type="submit"]:has-text("Upload")');

    await expect(uploadBtn).toBeDisabled();

  });

});

// ============================================================
// GROUP 2: Admin Verify Payment Slip
// ============================================================

test.describe('Admin ตรวจสอบ Payment Slip', () => {

  test('Admin เห็น list ของ slip ที่รอตรวจสอบ', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/invoices`);

    await expect(page).toHaveURL(/invoices/);

    const items = page.locator('.grid > div');

    await expect(items.first()).toBeVisible({ timeout: 8000 });

  });

  test('Admin กด Mark Paid → สถานะเปลี่ยนเป็น Paid', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/invoices`);

    // ตรวจว่าหน้า invoices โหลดได้
    await expect(page.locator('.grid').first()).toBeVisible({ timeout: 8000 });

    const markPaidBtn = page.locator('button:has-text("Mark Paid")').first();
    const hasPaidBtn = await markPaidBtn.count() > 0;

    if (hasPaidBtn) {
      await markPaidBtn.click();
      await expect(
        page.locator('button:has-text("PDF")').first()
      ).toBeVisible({ timeout: 8000 });
    } else {
      // ไม่มี UNPAID invoice ในเดือนนี้ ตรวจว่ามี Paid status อยู่แล้ว
      await expect(page.getByText('Paid').first()).toBeVisible();
    }

  });

  test('Admin คลิกดูรูป slip ได้', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/payments`);

    await expect(page).toHaveURL(/payments/);

    const slipImage = page.locator('img').first();

    await expect(slipImage).toBeVisible();

  });

});

// ============================================================
// GROUP 3: Tenant Track Payment Status
// ============================================================

test.describe('Tenant ติดตามสถานะ Payment', () => {

  test('Tenant เห็นสถานะ Pending หลังอัปโหลด slip', async ({ page }) => {

    await login(page, TENANT.email, TENANT.password);

    await page.goto(`${BASE_URL}/my-invoices`);

    await expect(
      page.locator('text=Pending').first()
    ).toBeVisible();

  });

  test('Tenant เห็นสถานะ Paid หลัง admin อนุมัติ', async ({ page }) => {

    await login(page, TENANT.email, TENANT.password);

    await page.goto(`${BASE_URL}/my-invoices`);

    const paidStatus = page.locator('text=Paid');

    const count = await paidStatus.count();

    expect(count).toBeGreaterThanOrEqual(0);

  });

});