import { test, expect } from '@playwright/test'

test.describe('Dream Analyzer - Initial Setup', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Dream Analyzer/)
    
    // Check for basic elements (will be implemented)
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('should have responsive design', async ({ page }) => {
    await page.goto('/')
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await expect(page.getByRole('main')).toBeVisible()
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('main')).toBeVisible()
  })
})