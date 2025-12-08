# Visual Regression Testing Strategy (Playwright)

## Overview
To prevent visual regressions (e.g., broken layouts, incorrect rendering of filters/shadows) that unit tests cannot catch, we recommend integrating **Playwright** for snapshot testing.

## Setup Guide

### 1. Installation
```bash
npm init playwright@latest
# Select: Typescript, GitHub Actions workflow
```

### 2. Configuration (`playwright.config.ts`)
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3. Verification Test (`e2e/canvas.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test('canvas renders correctly', async ({ page }) => {
  await page.goto('/');
  
  // Wait for canvas
  await expect(page.locator('[data-testid="collage-canvas"]')).toBeVisible();

  // Add an item (simulate drag drop logic or use specific test route)
  // ...

  // Take Screenshot
  await expect(page).toHaveScreenshot('landing-page.png', { maxDiffPixels: 100 });
});
```

### 4. Workflow Integration
Update `.github/workflows/playwright.yml` to run on PRs. Note that Linux rendering (CI) often differs slightly from macOS. Use Docker or only run visual tests on one OS to ensure consistency.

## Implementation Plan (Phase 15)
1.  Install Playwright.
2.  Create "Fixture Collages" (JSON files loaded on startup for testing).
3.  Establish baseline snapshots.
