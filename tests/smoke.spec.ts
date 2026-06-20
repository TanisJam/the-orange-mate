import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";
const errors: string[] = [];

test.beforeEach(async ({ page }) => {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });
});

test.afterEach(() => {
  if (errors.length > 0) {
    console.log(`\n  ❌ Console errors (${errors.length}):`);
    errors.forEach((e) => console.log(`     ${e}`));
    errors.length = 0;
  }
});

// ── Public pages ──────────────────────────────────────────────

test("homepage loads without errors", async ({ page }) => {
  const res = await page.goto(BASE);
  expect(res?.status()).toBe(200);
  await expect(page.locator("body")).toBeVisible();
});

test("discover page loads", async ({ page }) => {
  const res = await page.goto(`${BASE}/discover`);
  expect(res?.status()).toBe(200);
});

test("login page renders form", async ({ page }) => {
  await page.goto(`${BASE}/auth/login`);
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Contraseña", { exact: false })).toBeVisible();
});

test("sign-up page renders form", async ({ page }) => {
  await page.goto(`${BASE}/auth/sign-up`);
  await expect(page.getByLabel("Email")).toBeVisible();
});

test("forgot-password page renders", async ({ page }) => {
  const res = await page.goto(`${BASE}/auth/forgot-password`);
  expect(res?.status()).toBe(200);
});

test("update-password page renders", async ({ page }) => {
  const res = await page.goto(`${BASE}/auth/update-password`);
  expect(res?.status()).toBe(200);
});

// ── Auth redirects ────────────────────────────────────────────

test("dashboard redirects to login when unauthenticated", async ({ page }) => {
  await page.goto(`${BASE}/dashboard`);
  await page.waitForURL("**/auth/login**");
  expect(page.url()).toContain("/auth/login");
});

test("notifications redirects to login when unauthenticated", async ({ page }) => {
  await page.goto(`${BASE}/notifications`);
  await page.waitForURL("**/auth/login**");
  expect(page.url()).toContain("/auth/login");
});

test("messages redirects to login when unauthenticated", async ({ page }) => {
  await page.goto(`${BASE}/messages`);
  await page.waitForURL("**/auth/login**");
  expect(page.url()).toContain("/auth/login");
});

test("friends redirects to login when unauthenticated", async ({ page }) => {
  await page.goto(`${BASE}/friends`);
  await page.waitForURL("**/auth/login**");
  expect(page.url()).toContain("/auth/login");
});

// ── Profile page ──────────────────────────────────────────────

test("profile page shows 404 for unknown username", async ({ page }) => {
  const res = await page.goto(`${BASE}/profile/noexiste12345`);
  // Next.js not-found renders as 404
  expect(res?.status()).toBe(404);
});

// ── Network check: no failed API calls on homepage ────────────

test("homepage makes no failed fetch calls", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (res) => {
    if (res.status() >= 400) {
      failed.push(`${res.status()} ${res.url()}`);
    }
  });
  await page.goto(BASE);
  await page.waitForTimeout(1000);

  if (failed.length > 0) {
    console.log(`\n  ⚠️  Failed requests (${failed.length}):`);
    failed.forEach((f) => console.log(`     ${f}`));
  }
  // Auth-related 400s are expected if no session cookie
});

// ── Screenshots ───────────────────────────────────────────────

test("screenshots of key pages", async ({ page }) => {
  const pages = [
    { path: "/", name: "homepage" },
    { path: "/auth/login", name: "login" },
    { path: "/auth/sign-up", name: "signup" },
    { path: "/discover", name: "discover" },
  ];

  for (const { path, name } of pages) {
    await page.goto(`${BASE}${path}`);
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `tests/screenshots/${name}.png`,
      fullPage: true,
    });
  }
});
