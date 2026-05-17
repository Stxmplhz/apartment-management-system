# 🧪 Apartment Management System — E2E Tests

ไฟล์ test ทั้งหมดเขียนด้วย **Playwright + TypeScript**

---

## 📁 โครงสร้างไฟล์

```
tests/
├── 01-login-rbac.spec.ts          # Login และ Role-Based Access Control
├── 02-billing-invoice.spec.ts     # Meter Reading, Invoice, PDF Download
├── 03-payment-verification.spec.ts # Payment Slip อัปโหลด + Admin Accept/Reject
├── 04-maintenance-ticketing.spec.ts # Ticket สร้าง / Assign / Status Flow
└── 05-room-management-movein.spec.ts # Room Directory + Move-in + User Admin
```

---

## 🚀 วิธีติดตั้งและรัน

### 1. ติดตั้ง Playwright

```bash
# ติดตั้ง (ทำครั้งแรกครั้งเดียว)
npm init playwright@latest

# หรือถ้าโปรเจกต์มี package.json แล้ว
npm install -D @playwright/test
npx playwright install
```

### 2. วาง test files

คัดลอกไฟล์ทั้งหมดไปไว้ใน folder `tests/` ของโปรเจกต์

### 3. แก้ไข test accounts

เปิดไฟล์แต่ละไฟล์แล้วแก้ไข accounts ให้ตรงกับ seed data จริง:

```typescript
const ACCOUNTS = {
  admin: { email: 'YOUR_ADMIN_EMAIL', password: 'YOUR_ADMIN_PASSWORD' },
  tenant: { email: 'YOUR_TENANT_EMAIL', password: 'YOUR_TENANT_PASSWORD' },
  technician: { email: 'YOUR_TECH_EMAIL', password: 'YOUR_TECH_PASSWORD' },
};
```

### 4. แก้ไข BASE_URL

```typescript
const BASE_URL = 'http://localhost:5173'; // เปลี่ยนตาม port จริง
```

### 5. รัน test

```bash
# รัน test ทั้งหมด
npx playwright test

# รัน test เฉพาะไฟล์
npx playwright test tests/01-login-rbac.spec.ts

# รันแบบมี browser ให้เห็น (debug mode)
npx playwright test --headed

# ดูผลลัพธ์เป็น HTML report
npx playwright show-report
```

---

## ⚙️ playwright.config.ts แนะนำ

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',  // ถ่าย screenshot เมื่อ test ล้มเหลว
    video: 'retain-on-failure',     // บันทึกวิดีโอเมื่อล้มเหลว
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
});
```

---

## 📋 สรุป Test Cases ทั้งหมด

| Suite | จำนวน Test | ครอบคลุม |
|---|---|---|
| 01 Login & RBAC | 9 tests | Login สำเร็จ/ล้มเหลว, unauthorized access, logout |
| 02 Billing & Invoice | 8 tests | Meter reading, validation, invoice, PDF download |
| 03 Payment Verification | 9 tests | Upload slip, accept/reject, status tracking |
| 04 Maintenance Ticketing | 10 tests | สร้าง ticket, assign, status flow ครบ cycle |
| 05 Room & Move-in | 10 tests | Room directory, move-in flow, user admin |
| **รวม** | **~46 tests** | **ครอบคลุม critical path ทั้งหมด** |

---

## 💡 Tips

- **รัน backend + frontend ก่อนเสมอ** ก่อนรัน test
- ถ้า selector ไม่ตรง ให้ใช้ `npx playwright codegen http://localhost:5173` เพื่อ record selector จริง
- Test บางตัวขึ้นกับ **ลำดับการรัน** (เช่น test payment ต้องมี invoice ก่อน) — รัน suite ตามลำดับ 01→05
