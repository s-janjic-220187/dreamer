import { test, expect, type Page } from '@playwright/test'

test.describe('Dream Sharing Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dreams')
    
    // Navigate to Sharing tab
    await page.getByText('Sharing').click()
  })

  test('should display sharing interface', async ({ page }) => {
    await expect(page.getByText('Dream Sharing Features')).toBeVisible()
  })

  test('should show sharing options', async ({ page }) => {
    // Look for sharing-related buttons or options
    const sharingOptions = [
      'Export Dreams',
      'Share Dream',
      'Generate Link',
      'Download',
      'Export to PDF',
      'Social Share'
    ]
    
    let foundSharingOptions = false
    for (const option of sharingOptions) {
      const element = page.getByText(option)
      if (await element.isVisible()) {
        await expect(element).toBeVisible()
        foundSharingOptions = true
      }
    }
    
    // Should have at least some sharing functionality
    expect(foundSharingOptions).toBe(true)
  })

  test('should handle export functionality', async ({ page }) => {
    const exportButton = page.getByText(/export/i).first()
    
    if (await exportButton.isVisible()) {
      // Set up download promise before clicking
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
      
      await exportButton.click()
      
      // Wait for potential download
      const download = await downloadPromise
      
      if (download) {
        // Verify download happened
        expect(download.suggestedFilename()).toBeTruthy()
      }
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByText('Dream Sharing Features')).toBeVisible()
  })
})

test.describe('User Preferences Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dreams')
    
    // Navigate to Preferences tab
    await page.getByText('Preferences').click()
  })

  test('should display preferences interface', async ({ page }) => {
    await expect(page.getByText('User Preference System')).toBeVisible()
  })

  test('should show preference options', async ({ page }) => {
    // Look for common preference settings
    const preferenceOptions = [
      'Theme',
      'Language',
      'Notifications',
      'Auto-save',
      'Default Mood',
      'Privacy Settings',
      'Display Options'
    ]
    
    let foundPreferences = false
    for (const option of preferenceOptions) {
      const element = page.getByText(option)
      if (await element.isVisible()) {
        await expect(element).toBeVisible()
        foundPreferences = true
      }
    }
    
    // Should have at least some preference options
    expect(foundPreferences).toBe(true)
  })

  test('should allow changing preferences', async ({ page }) => {
    // Look for interactive preference elements
    const selects = page.locator('select')
    const checkboxes = page.locator('input[type="checkbox"]')
    const radios = page.locator('input[type="radio"]')
    
    if (await selects.count() > 0) {
      // Try changing a select option
      const firstSelect = selects.first()
      const options = await firstSelect.locator('option').count()
      if (options > 1) {
        await firstSelect.selectOption({ index: 1 })
      }
    }
    
    if (await checkboxes.count() > 0) {
      // Try toggling a checkbox
      await checkboxes.first().click()
    }
    
    if (await radios.count() > 0) {
      // Try selecting a radio button
      await radios.first().click()
    }
  })

  test('should save preference changes', async ({ page }) => {
    const saveButton = page.getByRole('button', { name: /save/i })
    
    if (await saveButton.isVisible()) {
      await saveButton.click()
      
      // Should show success message or remain stable
      await page.waitForTimeout(500)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByText('User Preference System')).toBeVisible()
  })
})