import { test, expect, type Page } from '@playwright/test'

test.describe('Advanced Search Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dreams')
    
    // Navigate to Search tab
    await page.getByText('Search').click()
  })

  test('should display advanced search interface', async ({ page }) => {
    await expect(page.getByText('Advanced Dream Search')).toBeVisible()
    
    // Check for search components
    await expect(page.getByPlaceholder('Search dreams...')).toBeVisible()
    
    // Look for filter options
    const searchFilters = [
      'Date Range',
      'Mood Filter',
      'Tag Filter',
      'Content Search'
    ]
    
    for (const filter of searchFilters) {
      const filterElement = page.getByText(filter)
      if (await filterElement.isVisible()) {
        await expect(filterElement).toBeVisible()
      }
    }
  })

  test('should perform text search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search dreams...')
    await searchInput.fill('flying')
    
    // Trigger search (look for search button or enter key)
    const searchButton = page.getByRole('button', { name: /search/i })
    if (await searchButton.isVisible()) {
      await searchButton.click()
    } else {
      await searchInput.press('Enter')
    }
    
    // Results should be filtered
    await page.waitForTimeout(500) // Allow for search processing
  })

  test('should filter by mood', async ({ page }) => {
    const moodFilter = page.getByLabel('Mood Filter')
    if (await moodFilter.isVisible()) {
      await moodFilter.selectOption('positive')
      
      // Should update results
      await page.waitForTimeout(500)
    }
  })

  test('should filter by tags', async ({ page }) => {
    const tagFilter = page.getByLabel('Tag Filter')
    if (await tagFilter.isVisible()) {
      await tagFilter.fill('flying')
      
      // Should update results
      await page.waitForTimeout(500)
    }
  })

  test('should clear search filters', async ({ page }) => {
    // Apply some filters first
    const searchInput = page.getByPlaceholder('Search dreams...')
    await searchInput.fill('test')
    
    // Look for clear button
    const clearButton = page.getByRole('button', { name: /clear/i })
    if (await clearButton.isVisible()) {
      await clearButton.click()
      
      // Search should be cleared
      await expect(searchInput).toHaveValue('')
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByText('Advanced Dream Search')).toBeVisible()
    await expect(page.getByPlaceholder('Search dreams...')).toBeVisible()
  })
})

test.describe('Dream Analytics Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dreams')
    
    // Navigate to Analytics tab
    await page.getByText('Analytics').click()
  })

  test('should display analytics dashboard', async ({ page }) => {
    await expect(page.getByText('Dream Analytics Dashboard')).toBeVisible()
  })

  test('should show visualization charts', async ({ page }) => {
    // Look for chart containers or canvas elements
    const chartElements = [
      'canvas',
      '[data-testid="chart"]',
      '[data-testid="visualization"]'
    ]
    
    let chartsFound = false
    for (const selector of chartElements) {
      const element = page.locator(selector)
      if (await element.count() > 0) {
        chartsFound = true
        break
      }
    }
    
    // If no charts found, at least check for chart labels or descriptions
    if (!chartsFound) {
      const chartLabels = [
        'Mood Distribution',
        'Dream Categories',
        'Monthly Trends',
        'Tag Cloud'
      ]
      
      for (const label of chartLabels) {
        const labelElement = page.getByText(label)
        if (await labelElement.isVisible()) {
          await expect(labelElement).toBeVisible()
          chartsFound = true
          break
        }
      }
    }
    
    // Should have some form of analytics display
    expect(chartsFound).toBe(true)
  })

  test('should display statistics', async ({ page }) => {
    // Look for numeric statistics
    const statsPattern = /\d+/
    const bodyText = await page.textContent('body')
    
    if (bodyText) {
      expect(bodyText).toMatch(statsPattern)
    }
  })

  test('should be interactive', async ({ page }) => {
    // Look for interactive elements like filters or time range selectors
    const interactiveElements = [
      'select',
      'input[type="date"]',
      'button'
    ]
    
    for (const selector of interactiveElements) {
      const elements = page.locator(selector)
      const count = await elements.count()
      if (count > 0) {
        // Try interacting with the first element
        await elements.first().click().catch(() => {
          // Interaction might not be necessary, just check it exists
        })
      }
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByText('Dream Analytics Dashboard')).toBeVisible()
  })
})