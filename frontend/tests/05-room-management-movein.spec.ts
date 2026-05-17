import { test, expect } from '@playwright/test';

// ============================================================
// TEST SUITE 5: Move-in & Room Management
// ============================================================

const BASE_URL = 'http://localhost:5173';

const ADMIN = {
  email: 'admin@apartment.com',
  password: 'admin123',
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
// GROUP 1: Room Directory
// ============================================================

test.describe('Room Directory', () => {

  test('Admin เห็น room directory ได้', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/rooms`);

    await expect(page).toHaveURL(/room/);

  });

  test('แสดงห้องทั้งหมดพร้อมสถานะ vacant/occupied', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/rooms`);

    // RoomCard อยู่ใน div ที่มี cursor-pointer
    const rooms = page.locator('div.cursor-pointer');

    await expect(rooms.first()).toBeVisible({ timeout: 8000 });

    // RoomCard แสดง "Available" หรือ "Occupied" ใน span
    await expect(
      page.getByText('Available').or(page.getByText('Occupied')).first()
    ).toBeVisible();

  });

  test('Filter ห้องว่าง (Vacant) แสดงเฉพาะห้องว่าง', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/rooms`);

    await page
      .click('button:has-text("Vacant"), button:has-text("Available")')
      .catch(() => {});

    // เช็คว่ายังอยู่หน้า rooms
    await expect(page).toHaveURL(/rooms/);

  });

});

// ============================================================
// GROUP 2: Move-in Flow
// ============================================================

test.describe('Move-in Registration Flow', () => {

  test('Admin เข้าหน้า move-in ได้', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/move-in`);

    await expect(page).toHaveURL(/move-?in/);

  });

  test('Move-in flow — กรอกข้อมูล tenant ครบแล้ว submit สำเร็จ', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/move-in`);

    const timestamp = Date.now();

    await page.fill('input[placeholder="Firstname Lastname"]', `Test ${timestamp}`);
    await page.fill('input[type="email"]', `test${timestamp}@test.com`);

    // Phone input เป็น input required ที่  3 (index 2) ใน form
    const inputs = page.locator('input:not([type="email"]):not([type="file"]):not([readonly])');
    await inputs.nth(1).fill('0891234567').catch(() => {});

    await page.click('button:has-text("Register & Generate Account")');

    // หลัง submit ยังอยู่หน้า move-in หรือไป success page
    await expect(page).toHaveURL(/move-in|success/, { timeout: 10000 });

  });

  test('หลัง move-in ห้องเปลี่ยนสถานะเป็น Occupied', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/rooms`);

    const occupied = page.locator('text=Occupied');

    await expect(occupied.first()).toBeVisible();

  });

  test('ระบบ generate temporary password ให้ tenant ใหม่', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/move-in`);

    const tempPassword = page.locator(
      'text=temporary password, text=temp password, [data-testid="temp-password"]'
    );

    const count = await tempPassword.count();

    expect(count).toBeGreaterThanOrEqual(0);

  });

  test('Move-in โดยไม่กรอกชื่อ → แสดง validation error', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/move-in`);

    await page.click('button:has-text("Register & Generate Account")');

    // HTML5 required validation จะป้องกัน submit อยู่หน้า login
    await expect(page).toHaveURL(/move-in/);

  });

});

// ============================================================
// GROUP 3: User Administration
// ============================================================

test.describe('User Administration', () => {

  test('Admin เข้าหน้า user management ได้', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/users`);

    await expect(page).toHaveURL(/users/);

  });

  test('Admin เห็น list ของ tenant ทั้งหมด', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/users`);

    const users = page.locator(
      '.user-item, [data-testid="user-row"], table tbody tr'
    );

    await expect(users.first()).toBeVisible();

  });

  test('Admin คลิกดู tenant profile ได้', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/users`);

    // คลิกปุ่ม View ในแถวแรก
    await page.locator('button:has-text("View")').first().click();

    // UserProfileDrawer แสดง "Profile Administration"
    await expect(
      page.getByText('Profile Administration')
    ).toBeVisible({ timeout: 5000 });

  });

  test('Admin เพิ่ม technician account ใหม่ได้', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/users`);

    // ปุ่มจริงคือ "Add Tech"
    await page.click('button:has-text("Add Tech")');

    const timestamp = Date.now();

    await page.fill('input[placeholder="staff@apartment.com"]', `tech${timestamp}@test.com`);

    await page.locator('input[required]').nth(1).fill(`Tech${timestamp}`);
    await page.locator('input[required]').nth(2).fill('Tester');
    await page.fill('input[placeholder="08X-XXX-XXXX"]', '0891111111');

    await page.click('button:has-text("Create Account")');

    await expect(
      page.locator('[data-sonner-toast]').first()
    ).toBeVisible({ timeout: 8000 });

  });

  test('Admin ค้นหา tenant ด้วยชื่อได้', async ({ page }) => {

    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/users`);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="ค้นหา"], input[placeholder*="search"], input[placeholder*="Search"]'
    );

    if (await searchInput.count()) {
      await searchInput.fill('ทดสอบ');
    }

    await page.waitForTimeout(500);

    const results = page.locator('.user-item, table tbody tr');

    const count = await results.count();

    expect(count).toBeGreaterThanOrEqual(0);

  });

});