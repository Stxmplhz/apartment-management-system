import { test, expect } from '@playwright/test';

// ============================================================
// TEST SUITE 1: Login & Role-Based Access Control (RBAC)
// ============================================================

const BASE_URL = 'http://localhost:5173';

const ACCOUNTS = {
  admin: {
    email: 'admin@apartment.com',
    password: 'admin123',
  },

  tenant: {
    email: 'somchai@email.com',
    password: 'tenant123',
  },

  technician: {
    email: 'technician@apartment.com',
    password: 'tech123',
  },
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
}

// ============================================================
// GROUP 1: Login Success
// ============================================================

test.describe('Login สำเร็จ', () => {

  test('Admin login แล้วถูก redirect ไปหน้า dashboard', async ({ page }) => {

    await login(
      page,
      ACCOUNTS.admin.email,
      ACCOUNTS.admin.password
    );
    
  await page.waitForURL(
    (url) => !url.pathname.includes('/login')
  );
    // Admin อยู่หน้า root "/"
    await expect(page).toHaveURL(`${BASE_URL}/`);

    // ตรวจว่ามีเมนู admin
    await expect(
      page.getByRole('link', { name: 'Rooms' })
    ).toBeVisible();
      });

  test('Tenant login แล้วถูก redirect ไปหน้า tenant dashboard', async ({ page }) => {

    await login(
      page,
      ACCOUNTS.tenant.email,
      ACCOUNTS.tenant.password
    );

    await expect(page).toHaveURL(/dashboard/);

  });

  test('Technician login แล้วถูก redirect ไปหน้า maintenance', async ({ page }) => {

    await login(
      page,
      ACCOUNTS.technician.email,
      ACCOUNTS.technician.password
    );

    await expect(page).toHaveURL(/maintenance/);

  });

});

// ============================================================
// GROUP 2: Login Fail
// ============================================================

test.describe('Login ล้มเหลว', () => {

  test('รหัสผ่านผิด → แสดง error message', async ({ page }) => {

    await login(
      page,
      ACCOUNTS.admin.email,
      'wrongpassword'
    );

    // ยังอยู่หน้า login
    await expect(page).toHaveURL(/login/);

    // มีข้อความ error
    await expect(
      page.getByText(/invalid username or password/i).first()
    ).toBeVisible();

  });

  test('email ไม่มีในระบบ → แสดง error message', async ({ page }) => {

    await login(
      page,
      'nobody@notexist.com',
      'anypassword'
    );

    await expect(page).toHaveURL(/login/);

  });

  test('กด submit โดยไม่กรอกอะไรเลย → ยังอยู่หน้า login', async ({ page }) => {

    await page.goto(`${BASE_URL}/login`);

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/login/);

  });

});

// ============================================================
// GROUP 3: RBAC
// ============================================================

test.describe('RBAC — ป้องกัน unauthorized access', () => {

  test('Tenant พยายามเข้า admin route → ถูก redirect', async ({ page }) => {

    await login(
      page,
      ACCOUNTS.tenant.email,
      ACCOUNTS.tenant.password
    );

    await page.goto(`${BASE_URL}/rooms`);

    await expect(page).not.toHaveURL(/\/rooms$/);

  });

  test('Technician พยายามเข้า admin route → ถูก redirect', async ({ page }) => {

    await login(
      page,
      ACCOUNTS.technician.email,
      ACCOUNTS.technician.password
    );

    await page.goto(`${BASE_URL}/users`);

    await expect(page).not.toHaveURL(/\/users$/);

  });

  test('ไม่ login เข้า protected route → ถูก redirect ไป login', async ({ page }) => {

    await page.goto(`${BASE_URL}/dashboard`);

    await expect(page).toHaveURL(/login/);

  });

});

// ============================================================
// GROUP 4: Logout
// ============================================================

test.describe('Logout', () => {

  test('Admin logout แล้วถูก redirect กลับ login', async ({ page }) => {

    await login(
      page,
      ACCOUNTS.admin.email,
      ACCOUNTS.admin.password
    );

    await expect(page).toHaveURL(`${BASE_URL}/`);

    // กด logout โดย evaluate ใน page context โดยตรง
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Sign out'));
      btn?.click();
    });

    // ต้องกลับ login
    await expect(page).toHaveURL(/login/);

  });

  test('หลัง logout แล้วกด back → ไม่สามารถกลับเข้า dashboard ได้', async ({ page }) => {

    await login(
      page,
      ACCOUNTS.admin.email,
      ACCOUNTS.admin.password
    );

    await expect(page).toHaveURL(`${BASE_URL}/`);

    // logout
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Sign out'));
      btn?.click();
    });

    // back
    await page.goBack();

    // ต้องถูกเด้งกลับ login
    await expect(page).toHaveURL(/login/);

  });

});