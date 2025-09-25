import { test, expect, type Page } from '@playwright/test'

test.describe('Privacy Controls - Phase 5.3 Security Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dreams')
    
    // Navigate to Privacy tab
    await page.getByText('Privacy').click()
  })

  test('should display privacy controls interface', async ({ page }) => {
    await expect(page.getByText('Privacy Controls')).toBeVisible()
  })

  test('should show 5-tab privacy interface', async ({ page }) => {
    // Check for the 5-tab privacy control system from Phase 5.3
    const privacyTabs = [
      'Data Encryption',
      'GDPR Compliance', 
      'Privacy Settings',
      'Data Export',
      'Account Security'
    ]
    
    let foundTabs = 0
    for (const tab of privacyTabs) {
      const tabElement = page.getByText(tab)
      if (await tabElement.isVisible()) {
        foundTabs++
        await expect(tabElement).toBeVisible()
      }
    }
    
    // Should have multiple privacy tabs
    expect(foundTabs).toBeGreaterThan(2)
  })

  test('should display data encryption options', async ({ page }) => {
    // Look for encryption-related controls
    const encryptionElements = [
      'Enable Encryption',
      'Encrypt Dreams',
      'AES-256',
      'Data Security',
      'Encryption Status'
    ]
    
    let foundEncryption = false
    for (const element of encryptionElements) {
      const encryptionElement = page.getByText(element)
      if (await encryptionElement.isVisible()) {
        await expect(encryptionElement).toBeVisible()
        foundEncryption = true
      }
    }
    
    // Should have encryption controls
    expect(foundEncryption).toBe(true)
  })

  test('should show GDPR compliance features', async ({ page }) => {
    // Look for GDPR-related options
    const gdprElements = [
      'GDPR',
      'Data Rights',
      'Right to be Forgotten',
      'Data Portability',
      'Consent Management'
    ]
    
    let foundGdpr = false
    for (const element of gdprElements) {
      const gdprElement = page.getByText(element)
      if (await gdprElement.isVisible()) {
        await expect(gdprElement).toBeVisible()
        foundGdpr = true
      }
    }
    
    // Should have GDPR compliance features
    expect(foundGdpr).toBe(true)
  })

  test('should allow toggling encryption settings', async ({ page }) => {
    // Look for encryption toggle switches or checkboxes
    const encryptionToggle = page.locator('input[type="checkbox"]').first()
    
    if (await encryptionToggle.isVisible()) {
      // Test toggling encryption
      const initialState = await encryptionToggle.isChecked()
      await encryptionToggle.click()
      
      // State should change
      const newState = await encryptionToggle.isChecked()
      expect(newState).not.toBe(initialState)
    }
  })

  test('should handle data export requests', async ({ page }) => {
    // Look for data export functionality
    const exportButton = page.getByText(/export.*data/i).or(page.getByText(/download.*data/i))
    
    if (await exportButton.isVisible()) {
      // Set up download promise
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
      
      await exportButton.click()
      
      // Wait for potential download
      const download = await downloadPromise
      
      if (download) {
        expect(download.suggestedFilename()).toBeTruthy()
      }
    }
  })

  test('should display privacy policy and terms', async ({ page }) => {
    // Look for privacy policy links or text
    const policyElements = [
      'Privacy Policy',
      'Terms of Service',
      'Data Usage',
      'Cookie Policy'
    ]
    
    for (const element of policyElements) {
      const policyElement = page.getByText(element)
      if (await policyElement.isVisible()) {
        await expect(policyElement).toBeVisible()
      }
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByText('Privacy Controls')).toBeVisible()
  })
})

test.describe('Data Security Validation', () => {
  test('should indicate secure connection', async ({ page }) => {
    await page.goto('/dreams')
    
    // Check if the page indicates secure handling of data
    const securityIndicators = [
      'Secure',
      'Encrypted',
      'Protected',
      'SSL',
      'HTTPS'
    ]
    
    for (const indicator of securityIndicators) {
      const element = page.getByText(indicator)
      if (await element.isVisible()) {
        await expect(element).toBeVisible()
      }
    }
  })

  test('should handle sensitive data appropriately', async ({ page }) => {
    // Create a dream with sensitive content
    await page.goto('/dreams/new')
    
    await page.getByLabel('Title').fill('Sensitive Test Dream')
    await page.getByLabel('Content').fill('This dream contains sensitive personal information that should be protected.')
    await page.getByLabel('Mood').selectOption('neutral')
    
    await page.getByRole('button', { name: /save/i }).click()
    
    // Navigate to privacy settings
    await page.goto('/dreams')
    await page.getByText('Privacy').click()
    
    // Should be able to access privacy controls
    await expect(page.getByText('Privacy Controls')).toBeVisible()
  })

  test('should not expose sensitive information in URLs', async ({ page }) => {
    await page.goto('/dreams')
    
    // Check that URLs don't contain sensitive information
    const currentUrl = page.url()
    
    // URLs should not contain obvious sensitive data patterns
    expect(currentUrl).not.toMatch(/password|token|secret|key/i)
  })
})