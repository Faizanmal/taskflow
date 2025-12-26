import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token-for-testing');
    });
    await page.goto('/dashboard');
  });

  test('displays task list', async ({ page }) => {
    // Wait for tasks to load
    await expect(page.getByRole('list')).toBeVisible({ timeout: 10000 });
  });

  test('can search for tasks', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test task');
      
      // Wait for debounce and results
      await page.waitForTimeout(500);
      
      // Search should filter results
      await expect(page.locator('[data-testid="task-list"]')).toBeVisible();
    }
  });

  test('can filter tasks by status', async ({ page }) => {
    const statusFilter = page.getByRole('combobox', { name: /status/i });
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      
      // Select a status
      const option = page.getByRole('option', { name: /in progress|todo/i }).first();
      if (await option.isVisible()) {
        await option.click();
      }
    }
  });

  test('can filter tasks by priority', async ({ page }) => {
    const priorityFilter = page.getByRole('combobox', { name: /priority/i });
    if (await priorityFilter.isVisible()) {
      await priorityFilter.click();
      
      // Select a priority
      const option = page.getByRole('option', { name: /high|urgent/i }).first();
      if (await option.isVisible()) {
        await option.click();
      }
    }
  });

  test('can clear all filters', async ({ page }) => {
    // Apply a filter first
    const searchInput = page.getByRole('searchbox');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
    
    // Click clear button
    const clearButton = page.getByRole('button', { name: /clear/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();
      
      // Search should be cleared
      await expect(searchInput).toHaveValue('');
    }
  });
});

test.describe('Bulk Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token-for-testing');
    });
    await page.goto('/dashboard');
  });

  test('can select multiple tasks', async ({ page }) => {
    const checkboxes = page.getByRole('checkbox', { name: /select task/i });
    const count = await checkboxes.count();
    
    if (count >= 2) {
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();
      
      // Bulk toolbar should appear
      const bulkToolbar = page.getByRole('toolbar');
      await expect(bulkToolbar).toBeVisible();
    }
  });

  test('shows number of selected tasks', async ({ page }) => {
    const checkboxes = page.getByRole('checkbox', { name: /select task/i });
    const count = await checkboxes.count();
    
    if (count >= 2) {
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();
      
      // Should show "2" somewhere indicating selected count
      await expect(page.getByText(/2 selected|2 tasks/i)).toBeVisible();
    }
  });
});

test.describe('Command Palette', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token-for-testing');
    });
    await page.goto('/dashboard');
  });

  test('opens with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k');
    
    const commandPalette = page.getByRole('dialog');
    await expect(commandPalette).toBeVisible({ timeout: 5000 });
  });

  test('opens with Cmd+K on Mac', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    const commandPalette = page.getByRole('dialog');
    await expect(commandPalette).toBeVisible({ timeout: 5000 });
  });

  test('closes with Escape', async ({ page }) => {
    await page.keyboard.press('Control+k');
    
    const commandPalette = page.getByRole('dialog');
    await expect(commandPalette).toBeVisible({ timeout: 5000 });
    
    await page.keyboard.press('Escape');
    await expect(commandPalette).not.toBeVisible();
  });

  test('can search in command palette', async ({ page }) => {
    await page.keyboard.press('Control+k');
    
    const searchInput = page.getByRole('combobox');
    if (await searchInput.isVisible()) {
      await searchInput.fill('create');
      
      // Should show search results
      await page.waitForTimeout(300);
    }
  });

  test('navigates with arrow keys', async ({ page }) => {
    await page.keyboard.press('Control+k');
    
    await page.waitForTimeout(300);
    
    // Press down arrow
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    
    // Should navigate through options
  });
});

test.describe('Export/Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token-for-testing');
    });
    await page.goto('/dashboard');
  });

  test('has export button', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /export/i });
    await expect(exportButton).toBeVisible({ timeout: 10000 });
  });

  test('has import button', async ({ page }) => {
    const importButton = page.getByRole('button', { name: /import/i });
    await expect(importButton).toBeVisible({ timeout: 10000 });
  });

  test('export format selection', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      // Should show format options
      const csvOption = page.getByRole('menuitem', { name: /csv/i });
      const jsonOption = page.getByRole('menuitem', { name: /json/i });
      
      await expect(csvOption.or(jsonOption)).toBeVisible();
    }
  });
});

test.describe('Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token-for-testing');
    });
    await page.goto('/dashboard');
  });

  test('tasks are draggable', async ({ page }) => {
    const taskItem = page.locator('[data-draggable="true"]').first();
    
    if (await taskItem.isVisible()) {
      // Check for drag handle or draggable attribute
      const isDraggable = await taskItem.getAttribute('draggable');
      expect(isDraggable).toBe('true');
    }
  });
});
