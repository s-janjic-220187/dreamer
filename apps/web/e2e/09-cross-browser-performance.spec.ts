import { test, expect, type Page } from '@playwright/test'

test.describe('Cross-Browser Compatibility', () => {
  test('should work correctly in Chromium', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'This test is for Chromium only')
    
    await page.goto('/')
    await expect(page.getByText('Welcome to Dream Analyzer')).toBeVisible()
    
    // Test core functionality
    await page.getByRole('link', { name: /start analyzing dreams/i }).click()
    await expect(page).toHaveURL('/dreams')
  })

  test('should work correctly in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'This test is for Firefox only')
    
    await page.goto('/')
    await expect(page.getByText('Welcome to Dream Analyzer')).toBeVisible()
    
    // Test core functionality
    await page.getByRole('link', { name: /start analyzing dreams/i }).click()
    await expect(page).toHaveURL('/dreams')
  })

  test('should work correctly in WebKit', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'This test is for WebKit only')
    
    await page.goto('/')
    await expect(page.getByText('Welcome to Dream Analyzer')).toBeVisible()
    
    // Test core functionality
    await page.getByRole('link', { name: /start analyzing dreams/i }).click()
    await expect(page).toHaveURL('/dreams')
  })
})

test.describe('Mobile Responsive Design', () => {
  test('should display correctly on mobile portrait', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone 8
    
    await page.goto('/')
    
    // Check mobile layout
    await expect(page.getByText('Welcome to Dream Analyzer')).toBeVisible()
    await expect(page.getByRole('link', { name: /start analyzing dreams/i })).toBeVisible()
    
    // Navigation should work on mobile
    await page.getByRole('link', { name: /start analyzing dreams/i }).click()
    await expect(page).toHaveURL('/dreams')
    
    // Tabs should be accessible
    await expect(page.getByText('Dreams')).toBeVisible()
  })

  test('should display correctly on mobile landscape', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 }) // iPhone 8 landscape
    
    await page.goto('/dreams')
    
    await expect(page.getByText('Dream Journal')).toBeVisible()
    await expect(page.getByText('Add New Dream')).toBeVisible()
  })

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    
    await page.goto('/dreams')
    
    await expect(page.getByText('Dream Journal')).toBeVisible()
    
    // Test tab navigation on tablet
    await page.getByText('Analytics').click()
    await expect(page.getByText('Dream Analytics Dashboard')).toBeVisible()
  })

  test('should handle touch interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/dreams/new')
    
    // Test form interactions on touch device
    await page.getByLabel('Title').fill('Mobile Touch Test')
    await page.getByLabel('Content').fill('Testing touch interactions on mobile device.')
    
    await expect(page.getByLabel('Title')).toHaveValue('Mobile Touch Test')
  })
})

test.describe('Performance and Loading', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await expect(page.getByText('Welcome to Dream Analyzer')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(5000) // Should load within 5 seconds
  })

  test('should handle navigation efficiently', async ({ page }) => {
    await page.goto('/')
    
    const startTime = Date.now()
    await page.getByRole('link', { name: /start analyzing dreams/i }).click()
    await expect(page.getByText('Dream Journal')).toBeVisible()
    
    const navigationTime = Date.now() - startTime
    expect(navigationTime).toBeLessThan(3000) // Navigation should be quick
  })

  test('should handle large amounts of data', async ({ page }) => {
    await page.goto('/dreams')
    
    // Simulate scrolling through large dataset
    await page.evaluate(() => {
      for (let i = 0; i < 100; i++) {
        window.scrollBy(0, 100)
      }
    })
    
    // Page should remain responsive
    await expect(page.getByText('Dream Journal')).toBeVisible()
  })
})

test.describe('Accessibility Compliance', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1) // Should have exactly one h1
    
    const h2 = page.locator('h2')
    const h2Count = await h2.count()
    expect(h2Count).toBeGreaterThan(0) // Should have h2 elements
  })

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/dreams/new')
    
    // Check that form fields have proper labels
    await expect(page.getByLabel('Title')).toBeVisible()
    await expect(page.getByLabel('Content')).toBeVisible()
    await expect(page.getByLabel('Mood')).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to navigate with keyboard
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have appropriate color contrast', async ({ page }) => {
    await page.goto('/')
    
    // Check that text is visible (basic contrast check)
    await expect(page.getByText('Welcome to Dream Analyzer')).toBeVisible()
    await expect(page.getByText('Features')).toBeVisible()
  })
})

test.describe('Error Handling and Edge Cases', () => {
  test('should handle invalid URLs gracefully', async ({ page }) => {
    await page.goto('/invalid-url-that-does-not-exist')
    
    // Should not crash, might redirect to home or show 404
    // The app should remain functional
    await page.waitForTimeout(1000)
    
    // Try navigating to a valid page
    await page.goto('/dreams')
    await expect(page.getByText('Dream Journal')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/dreams')
    
    // Simulate network going offline
    await page.context().setOffline(true)
    
    // App should handle offline state
    await page.reload().catch(() => {
      // Reload might fail when offline
    })
    
    // Restore network
    await page.context().setOffline(false)
    
    await page.goto('/dreams')
    await expect(page.getByText('Dream Journal')).toBeVisible()
  })

  test('should handle rapid user interactions', async ({ page }) => {
    await page.goto('/dreams')
    
    // Rapid tab switching
    for (let i = 0; i < 5; i++) {
      await page.getByText('Analytics').click()
      await page.getByText('Dreams').click()
      await page.getByText('Search').click()
      await page.getByText('Dreams').click()
    }
    
    // App should remain stable
    await expect(page.getByText('Dream Journal')).toBeVisible()
  })
})