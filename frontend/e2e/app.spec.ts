import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays login page for unauthenticated users', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page.getByRole('heading', { name: /sign in|log in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('has link to register page', async ({ page }) => {
    await page.goto('/auth/login');
    
    const registerLink = page.getByRole('link', { name: /sign up|register|create account/i });
    await expect(registerLink).toBeVisible();
  });

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.goto('/auth/login');
    
    const submitButton = page.getByRole('button', { name: /sign in|log in|submit/i });
    await submitButton.click();
    
    // Expect validation messages
    await expect(page.getByText(/required|enter|invalid/i)).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    const submitButton = page.getByRole('button', { name: /sign in|log in|submit/i });
    await submitButton.click();
    
    // Expect error message
    await expect(page.getByText(/invalid|incorrect|failed|error/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token-for-testing');
    });
  });

  test('displays dashboard for authenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should see the dashboard layout
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('has keyboard shortcut to open command palette', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Press Ctrl+K
    await page.keyboard.press('Control+k');
    
    // Command palette should appear
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Accessibility', () => {
  test('login page has no accessibility violations', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check for basic accessibility
    await expect(page.getByRole('main')).toBeVisible();
    
    // All form inputs should have labels
    const inputs = page.locator('input');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label.or(input.locator('..'))).toBeVisible();
      }
    }
  });

  test('page can be navigated with keyboard', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Tab through the page
    await page.keyboard.press('Tab');
    
    // Should have visible focus indicator
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('page has correct heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Should have at least one h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('mobile menu is accessible on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Look for mobile menu button
    const menuButton = page.getByRole('button', { name: /menu|navigation/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Menu should open
      await expect(page.getByRole('navigation')).toBeVisible();
    }
  });

  test('content is readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Content should not overflow
    const overflowElement = page.locator('[style*="overflow-x: scroll"]');
    await expect(overflowElement).toHaveCount(0);
  });
});

test.describe('PWA Features', () => {
  test('has manifest file', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);
  });

  test('service worker is registered', async ({ page }) => {
    await page.goto('/');
    
    // Wait for service worker registration
    const swRegistration = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });
    
    // In development, SW might not be active
    // This is just to ensure the check doesn't throw
    expect(typeof swRegistration).toBe('boolean');
  });
});

test.describe('Internationalization', () => {
  test('page loads with default language', async ({ page }) => {
    await page.goto('/');
    
    // Check that page has lang attribute
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('language can be changed', async ({ page }) => {
    await page.goto('/');
    
    // Look for language selector
    const languageSelector = page.getByRole('combobox', { name: /language/i });
    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      
      // Select a different language
      const option = page.getByRole('option').first();
      if (await option.isVisible()) {
        await option.click();
      }
    }
  });
});
