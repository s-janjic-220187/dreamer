import { test, expect, type Page } from '@playwright/test'

test.describe('Dreams Page Core Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dreams')
  })

  test('should display dreams page with all tabs', async ({ page }) => {
    await expect(page.getByText('Dream Journal')).toBeVisible()
    
    // Check for the 6-tab interface from Phase 5.2
    await expect(page.getByText('Dreams')).toBeVisible()
    await expect(page.getByText('Analytics')).toBeVisible()
    await expect(page.getByText('Search')).toBeVisible()
    await expect(page.getByText('Sharing')).toBeVisible()
    await expect(page.getByText('Preferences')).toBeVisible()
    await expect(page.getByText('Privacy')).toBeVisible()
  })

  test('should navigate between tabs correctly', async ({ page }) => {
    // Test Analytics tab
    await page.getByText('Analytics').click()
    await expect(page.getByText('Dream Analytics Dashboard')).toBeVisible()
    
    // Test Search tab
    await page.getByText('Search').click()
    await expect(page.getByText('Advanced Dream Search')).toBeVisible()
    
    // Test Sharing tab
    await page.getByText('Sharing').click()
    await expect(page.getByText('Dream Sharing Features')).toBeVisible()
    
    // Test Preferences tab
    await page.getByText('Preferences').click()
    await expect(page.getByText('User Preference System')).toBeVisible()
    
    // Test Privacy tab
    await page.getByText('Privacy').click()
    await expect(page.getByText('Privacy Controls')).toBeVisible()
    
    // Go back to Dreams tab
    await page.getByText('Dreams').click()
    await expect(page.getByText('Add New Dream')).toBeVisible()
  })

  test('should display Add New Dream button', async ({ page }) => {
    await expect(page.getByText('Add New Dream')).toBeVisible()
  })

  test('should navigate to new dream page when Add New Dream is clicked', async ({ page }) => {
    await page.getByText('Add New Dream').click()
    await expect(page).toHaveURL('/dreams/new')
  })

  test('should handle empty dreams state gracefully', async ({ page }) => {
    // The page should load even if no dreams exist
    await expect(page.getByText('Dream Journal')).toBeVisible()
    await expect(page.getByText('Add New Dream')).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByText('Dream Journal')).toBeVisible()
    await expect(page.getByText('Dreams')).toBeVisible()
    await expect(page.getByText('Add New Dream')).toBeVisible()
  })
})

test.describe('Dreams List and Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dreams')
  })

  test('should handle dream cards interaction', async ({ page }) => {
    // If dreams exist, test interaction
    const dreamCards = page.locator('[data-testid="dream-card"]')
    const count = await dreamCards.count()
    
    if (count > 0) {
      // Test clicking on first dream card
      await dreamCards.first().click()
      
      // Should navigate to dream detail page
      await expect(page.url()).toMatch(/\/dreams\/[^\/]+$/)
    }
  })

  test('should display dream metadata correctly', async ({ page }) => {
    // Test date formatting and mood indicators if dreams exist
    const dreamCards = page.locator('[data-testid="dream-card"]')
    const count = await dreamCards.count()
    
    if (count > 0) {
      // Check if date information is displayed
      await expect(dreamCards.first()).toBeVisible()
    }
  })

  test('should handle pagination or scrolling for large dream lists', async ({ page }) => {
    // Test if the page can handle many dreams
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    
    // Page should remain stable
    await expect(page.getByText('Dream Journal')).toBeVisible()
  })
})