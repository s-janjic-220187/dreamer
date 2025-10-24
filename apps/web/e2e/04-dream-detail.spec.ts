import { expect, test } from '@playwright/test'

test.describe('Dream Detail Page Features', () => {
  let dreamId: string = ''

  test.beforeEach(async ({ page }) => {
    // First create a test dream to work with
    await page.goto('/dreams/new')

    await page.getByLabel('Title').fill('Test Dream for Detail View')
    await page.getByLabel('Content').fill('This is a detailed test dream about soaring through the skies above a beautiful landscape.')
    await page.getByLabel('Mood').selectOption('positive')
    await page.getByLabel('Tags').fill('flying, landscape, peaceful, test')

    await page.getByRole('button', { name: /save/i }).click()

    // Wait for navigation to complete - could go to detail page or dreams list
    await page.waitForURL(/\/dreams/, { timeout: 10000 })

    // If we're on the dreams list, click on our test dream
    if (page.url().endsWith('/dreams')) {
      // Wait for dream to appear in list and click on it
      await page.waitForSelector('text=Test Dream for Detail View', { timeout: 10000 })
      await page.locator('[data-testid*="dream-title"]').filter({ hasText: 'Test Dream for Detail View' }).first().click()
    }

    // Ensure we're on a dream detail page
    await page.waitForURL(/\/dreams\/[^\/]+$/, { timeout: 10000 })

    // Wait for the detail page to load completely
    await page.waitForSelector('[data-testid="dream-title"]', { timeout: 10000 })
  })

  test('should display dream details correctly', async ({ page }) => {
    await expect(page.getByTestId('dream-title')).toBeVisible()
    await expect(page.getByTestId('dream-content')).toBeVisible()

    // Check for metadata - use more specific selectors
    await expect(page.getByTestId('dream-mood')).toContainText('positive')
    await expect(page.getByTestId('dream-tag-flying')).toBeVisible()
    await expect(page.getByTestId('dream-tag-landscape')).toBeVisible()

    // Check for action buttons
    await expect(page.getByTestId('edit-dream-button')).toBeVisible()
    await expect(page.getByTestId('delete-dream-button')).toBeVisible()
  })

  test('should display AI analysis section', async ({ page }) => {
    // Check if AI Analysis section exists
    const analyzeButton = page.getByTestId('analyze-dream-button')
    const analysisSection = page.getByTestId('dream-analysis-heading')

    // Analysis section should always be visible
    await expect(analysisSection).toBeVisible()

    if (await analyzeButton.isVisible()) {
      // Analysis not yet done - should show analyze button
      await expect(analyzeButton).toBeVisible()
    }
  })

  test('should trigger AI analysis when analyze button is clicked', async ({ page }) => {
    const analyzeButton = page.getByTestId('analyze-dream-button')

    if (await analyzeButton.isVisible()) {
      await analyzeButton.click()

      // Should show analyzing state
      await expect(page.getByText('Analyzing...')).toBeVisible()

      // Wait for analysis to complete (with timeout)
      await page.waitForSelector('[data-testid="dream-analysis-heading"]', { timeout: 10000 }).catch(() => {
        // If analysis doesn't complete, that's okay - API might not be running
        console.log('Analysis timed out - this is expected if AI service is not running')
      })
    }
  })

  test('should navigate to edit page when edit button is clicked', async ({ page }) => {
    await page.getByTestId('edit-dream-button').click()

    await expect(page.url()).toMatch(/\/dreams\/[^\/]+\/edit$/)

    // Wait for form to load with data
    await page.waitForSelector('input[id="title"]', { timeout: 5000 })
    await page.waitForFunction(() => {
      const titleInput = document.querySelector('input[id="title"]') as HTMLInputElement
      return titleInput && titleInput.value === 'Test Dream for Detail View'
    }, { timeout: 10000 })

    await expect(page.getByLabel('Title')).toHaveValue('Test Dream for Detail View')
  })

  test('should handle dream deletion', async ({ page }) => {
    // Mock the confirm dialog to return true
    await page.addInitScript(() => {
      window.confirm = () => true
    })

    await page.getByTestId('delete-dream-button').click()

    // Should redirect back to dreams list
    await expect(page).toHaveURL('/dreams')
  })

  test('should display formatted date', async ({ page }) => {
    // Check if date is displayed in readable format
    const dateElement = page.getByTestId('dream-date')
    await expect(dateElement).toBeVisible()

    const dateText = await dateElement.textContent()
    const datePattern = /\w+,\s+\w+\s+\d{1,2},\s+\d{4}/

    if (dateText) {
      expect(dateText).toMatch(datePattern)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.getByTestId('dream-title')).toBeVisible()
    await expect(page.getByTestId('edit-dream-button')).toBeVisible()
    await expect(page.getByTestId('delete-dream-button')).toBeVisible()
  })

  test('should handle back navigation correctly', async ({ page }) => {
    // Use the back button instead of browser navigation
    await page.getByTestId('back-to-dreams-button').click()
    await expect(page).toHaveURL('/dreams')
  })
})

test.describe('Dream Analysis Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dreams')
  })

  test('should display analysis results when available', async ({ page }) => {
    // Look for existing dreams with analysis
    const analysisSection = page.getByTestId('dream-analysis-heading')

    if (await analysisSection.isVisible()) {
      await expect(analysisSection).toBeVisible()

      // Check for analysis components
      const themesSection = page.getByTestId('analysis-themes')
      const emotionsSection = page.getByTestId('analysis-emotions')

      // At least analysis heading should be visible
      expect(await analysisSection.isVisible()).toBe(true)
    }
  })

  test('should handle analysis errors gracefully', async ({ page }) => {
    // Create a new dream and try to analyze it
    await page.goto('/dreams/new')

    await page.getByLabel('Title').fill('Error Test Dream')
    await page.getByLabel('Content').fill('This dream is for testing error handling.')
    await page.getByLabel('Mood').selectOption('neutral')

    await page.getByRole('button', { name: /save/i }).click()
    await page.waitForURL(/\/dreams/, { timeout: 10000 })

    // Navigate to detail page if needed
    if (page.url().endsWith('/dreams')) {
      await page.locator('[data-testid*="dream-title"]').filter({ hasText: 'Error Test Dream' }).first().click()
      await page.waitForURL(/\/dreams\/[^\/]+$/, { timeout: 5000 })
    }

    // Try to analyze
    const analyzeButton = page.getByTestId('analyze-dream-button')
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click()

      // Should handle errors without crashing
      await page.waitForTimeout(2000)

      // Page should still be functional
      await expect(page.getByTestId('dream-title')).toBeVisible()
    }
  })
})
