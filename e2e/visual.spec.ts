import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Visual Regression Suite', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('full creative flow', async ({ page }) => {
        // 1. Initial State
        await expect(page.locator('[data-testid="collage-canvas-container"]')).toBeVisible();
        await expect(page).toHaveScreenshot('01-initial-state.png', { maxDiffPixels: 100 });

        // 2. Upload Images
        // We use setInputFiles to simulate uploading the fixtures
        const file1 = path.resolve('e2e/fixtures/image1.png');
        const file2 = path.resolve('e2e/fixtures/image2.png');

        await page.locator('[data-testid="file-upload-input"]').setInputFiles([file1, file2]);

        // Wait for images to appear in sidebar (they have class 'group aspect-square...')
        // We can't strictly count on timing, but let's wait for at least one img tag in the sidebar
        await page.waitForSelector('div.p-4.flex-1 img[src^="data:image"]');

        // 3. Drag Images to Canvas
        // We need to locate the images in the sidebar. 
        // The "plus" button is the first child of the grid, so images start at index 1
        const sidebarImages = page.locator('div.grid.grid-cols-2.gap-3 > div.relative.group');
        await expect(sidebarImages).toHaveCount(2);

        const canvas = page.locator('[data-testid="collage-canvas-container"]');
        const canvasBox = await canvas.boundingBox();
        if (!canvasBox) throw new Error("Canvas not found");

        // Drag image 1 to center
        await sidebarImages.first().dragTo(canvas, { targetPosition: { x: canvasBox.width / 2 - 100, y: canvasBox.height / 2 } });
        await page.waitForTimeout(500); // Wait for canvas update

        // Drag image 2 to center (slightly offset)
        await sidebarImages.nth(1).dragTo(canvas, { targetPosition: { x: canvasBox.width / 2 + 100, y: canvasBox.height / 2 } });
        await page.waitForTimeout(500);

        // Snapshot: Two images on canvas (Free layout)
        await expect(page).toHaveScreenshot('02-images-on-canvas-free.png', { maxDiffPixels: 300 });

        // 4. Switch to Layouts Tab
        await page.locator('[data-testid="nav-layouts"]').click();

        // 5. Apply Grid Layout
        await page.locator('[data-testid="layout-grid"]').click();
        await page.waitForTimeout(500); // Animation
        await expect(page).toHaveScreenshot('03-layout-grid.png', { maxDiffPixels: 100 });

        // 6. Apply Mosaic Layout
        await page.locator('[data-testid="layout-mosaic"]').click();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot('04-layout-mosaic.png', { maxDiffPixels: 100 });

        // 7. Customize Styles (Background & Padding)
        // Deselect any item first by clicking canvas background
        const stage = page.locator('.konvajs-content');
        await stage.click({ position: { x: 10, y: 10 }, force: true }); // Click top left corner (empty)

        // Verify Right Panel shows Canvas Settings
        const colorPicker = page.locator('[data-testid="bg-color-picker"]');
        await expect(colorPicker).toBeVisible();

        // Change Background Color to a nice teal
        await colorPicker.fill('#0d9488'); // teal-600

        // Change Padding (slider)
        const paddingSlider = page.locator('[data-testid="padding-slider"]');
        await paddingSlider.fill('40');
        // Trigger change event if necessary (React sometimes needs it)
        await paddingSlider.evaluate(e => e.dispatchEvent(new Event('input', { bubbles: true })));
        await paddingSlider.evaluate(e => e.dispatchEvent(new Event('change', { bubbles: true })));

        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot('05-styled-collage.png', { maxDiffPixels: 100 });
    });

});
