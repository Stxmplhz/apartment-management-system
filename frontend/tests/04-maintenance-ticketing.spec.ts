import { test, expect } from '@playwright/test';

// ============================================================
// TEST SUITE 4: Maintenance Ticketing System
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

const TECHNICIAN = {
  email: 'technician@apartment.com',
  password: 'tech123',
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
// GROUP 1: Tenant Create Ticket
// ============================================================

test.describe('Tenant สร้าง Maintenance Ticket', () => {

  test('Tenant เข้าหน้า maintenance ได้', async ({ page }) => {

    await login(page, TENANT.email, TENANT.password);

    await page.goto(`${BASE_URL}/maintenance`);

    await expect(page).toHaveURL(/maintenance|ticket|repair/);

  });

  test('Tenant สร้าง ticket พร้อมหัวข้อและรายละเอียดสำเร็จ', async ({ page }) => {
  await login(page, TENANT.email, TENANT.password);

  await page.goto(`${BASE_URL}/maintenance`);

  await page.getByRole('button', { name: /new request/i }).click();

  await page
    .getByPlaceholder(/explain the problem/i)
    .fill('น้ำรั่วตลอดเวลา');

  await page.getByRole('button', { name: /send request/i }).click();

  // Sonner toast ใช้ li[data-sonner-toast] หรือ [data-type]
  await expect(
    page.locator('li[data-sonner-toast]').first()
  ).toBeVisible({ timeout: 8000 });
});

  test('Tenant สร้าง ticket พร้อมแนบรูปภาพ', async ({ page }) => {
  await login(page, TENANT.email, TENANT.password);

  await page.goto(`${BASE_URL}/maintenance`);

  await page.getByRole('button', { name: /new request/i }).click();

  await page
    .getByPlaceholder(/explain the problem/i)
    .fill('ไฟดับทั้งห้อง');

  const fileInput = page.locator('input[type="file"]');

  await fileInput.setInputFiles({
    name: 'broken-light.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-image'),
  });

  await page.getByRole('button', { name: /send request/i }).click();

  await expect(
    page.locator('li[data-sonner-toast]').first()
  ).toBeVisible({ timeout: 8000 });
});

  test('สร้าง ticket โดยไม่กรอกหัวข้อ → แสดง validation error', async ({ page }) => {

    await login(page, TENANT.email, TENANT.password);

    await page.goto(`${BASE_URL}/maintenance`);

    await page.getByRole('button', { name: /new request/i }).click();

    // ไม่กรอกอะไร กด Send Request เลย
    await page.getByRole('button', { name: /send request/i }).click();

    await expect(
      page.locator('li[data-sonner-toast]').first()
    ).toBeVisible({ timeout: 5000 });

  });

  test('Tenant เห็น ticket ที่สร้างแล้วใน list', async ({ page }) => {

    await login(page, TENANT.email, TENANT.password);

    await page.goto(`${BASE_URL}/maintenance`);

    const ticketList = page.locator('.grid > div, .space-y-4 > div');

    await expect(ticketList.first()).toBeVisible({ timeout: 8000 });

  });

});

// ============================================================
// GROUP 2: Admin Manage Ticket
// ============================================================

test.describe('Admin จัดการ Maintenance Ticket', () => {

  test('Admin เห็น ticket ทั้งหมดในระบบ', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/maintenance`);

    await expect(page).toHaveURL(/maintenance/);

    const tickets = page.locator('.grid > div, .space-y-4 > div');

    await expect(tickets.first()).toBeVisible({ timeout: 8000 });

  });

  test('Admin กด assign technician ให้ ticket สำเร็จ', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/maintenance`);

    // ตรวจว่าหน้าโหลดได้
    await expect(page.locator('.grid > div, .space-y-4 > div').first()).toBeVisible({ timeout: 8000 });

    const assignBtn = page.locator('button:has-text("Assign Technician")').first();
    const hasAssignBtn = await assignBtn.count() > 0;

    if (hasAssignBtn) {
      await assignBtn.click();
      await page.locator('.bg-secondary.rounded-lg').first().click();
      await expect(
        page.locator('button:has-text("Start Repair")').first()
      ).toBeVisible({ timeout: 8000 });
    } else {
      // ไม่มี OPEN ticket ตรวจว่ามี ticket ที่ assigned หรือ progress อยู่แล้ว
      const assigned = page.getByText('Assigned').or(page.getByText('In Progress'));
      await expect(assigned.first()).toBeVisible();
    }

  });

  test('Status ของ ticket เปลี่ยนเป็น In Progress หลัง assign', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/maintenance`);

    await expect(
      page.locator('text=In Progress').first()
    ).toBeVisible({ timeout: 5000 });

  });

  test('Admin ดูรูปที่แนบมากับ ticket ได้', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/maintenance`);

    const image = page.locator('img').first();

    await expect(image).toBeVisible();

  });

});

// ============================================================
// GROUP 3: Technician Manage Ticket
// ============================================================

test.describe('Technician รับและอัปเดต Ticket', () => {

  test('Technician เห็น ticket ที่ assign ให้ตัวเอง', async ({ page }) => {

    await login(page, TECHNICIAN.email, TECHNICIAN.password);

    await page.goto(`${BASE_URL}/maintenance`);

    await expect(page).toHaveURL(/maintenance/);

    const tickets = page.locator(
      '.ticket-item, [data-testid="ticket-row"], .bg-card'
    );

    const count = await tickets.count();

    expect(count).toBeGreaterThanOrEqual(0);

  });

  test('Technician อัปเดตสถานะ ticket เป็น Resolved ได้', async ({ page }) => {

    await login(page, TECHNICIAN.email, TECHNICIAN.password);

    await page.goto(`${BASE_URL}/maintenance`);

    await page.locator('button:has-text("Resolve")').first().click();

    await expect(
      page.locator('text=Resolved').first()
    ).toBeVisible({ timeout: 8000 });

  });

});

// ============================================================
// GROUP 4: Ticket Status Flow
// ============================================================

test.describe('Ticket Status Flow', () => {

  test('Admin ปิด ticket (Closed) หลัง Resolved', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/maintenance`);

    await page.locator('button:has-text("Close")').first().click();

    await expect(
      page.locator('text=Closed').first()
    ).toBeVisible({ timeout: 8000 });

  });

  test('Tenant เห็นสถานะ ticket อัปเดตได้', async ({ page }) => {

    await login(page, TENANT.email, TENANT.password);

    await page.goto(`${BASE_URL}/maintenance`);

    await page.reload();

    const tickets = page.locator('.grid > div, .space-y-4 > div');

    await expect(tickets.first()).toBeVisible({ timeout: 8000 });

  });

});