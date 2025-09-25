import { test, expect, type Page } from '@playwright/test'

test.describe('Application Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load homepage correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome to Dream Analyzer')
    await expect(page.locator('h2')).toContainText('Unlock the meaning behind your dreams')
    await expect(page.getByText('Our AI-powered dream analysis')).toBeVisible()
  })

  test('should display homepage features section', async ({ page }) => {
    await expect(page.getByText('Features', { exact: true })).toBeVisible()
    await expect(page.getByText('🎤 Voice Recording')).toBeVisible()
    await expect(page.getByText('🤖 AI Analysis')).toBeVisible()
    await expect(page.getByText('📚 Dream Journal')).toBeVisible()
    await expect(page.getByText('🔒 Privacy First')).toBeVisible()
  })

  test('should navigate to dreams page via Start Analyzing button', async ({ page }) => {
    await page.getByRole('link', { name: /start analyzing dreams/i }).click()
    await expect(page).toHaveURL('/dreams')
    await expect(page.getByText('Dream Journal')).toBeVisible()
  })

  test('should navigate to dreams page via View Journal button', async ({ page }) => {
    await page.getByRole('link', { name: /view dream journal/i }).click()
    await expect(page).toHaveURL('/dreams')
    await expect(page.getByText('Dream Journal')).toBeVisible()
  })

  test('should have responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone size
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText('Features')).toBeVisible()
    await expect(page.getByRole('link', { name: /start analyzing dreams/i })).toBeVisible()
  })

  test('should navigate back to home from dreams page', async ({ page }) => {
    await page.getByRole('link', { name: /start analyzing dreams/i }).click()
    await page.goBack()
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('Welcome to Dream Analyzer')
  })
})

test.describe('Layout and Header Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dreams')
  })

  test('should display navigation layout consistently', async ({ page }) => {
    // Check if main layout elements are present
    await expect(page.locator('main')).toBeVisible()
    
    // Navigate between pages to test layout consistency
    await page.goto('/')
    await expect(page.locator('main')).toBeVisible()
    
    await page.goto('/dreams')
    await expect(page.locator('main')).toBeVisible()
  })

  test('should maintain accessibility standards', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
    
    // Check for proper semantic structure
    await expect(page.locator('main')).toBeVisible()
  })
})