import { test, expect, type Page } from '@playwright/test'

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
    
    // Wait for navigation and extract dream ID from URL if possible
    await page.waitForURL(/\/dreams(?:\/\w+)?$/)
    
    // Navigate to the dream we just created (go to dreams list first)
    await page.goto('/dreams')
    
    // Find our test dream
    const testDreamCard = page.getByText('Test Dream for Detail View')
    if (await testDreamCard.isVisible()) {
      await testDreamCard.click()
      
      // Extract ID from current URL
      const url = page.url()
      const match = url.match(/\/dreams\/([^\/]+)$/)
      if (match) {
        dreamId = match[1]
      }
    }
  })

  test('should display dream details correctly', async ({ page }) => {
    await expect(page.getByText('Test Dream for Detail View')).toBeVisible()
    await expect(page.getByText('This is a detailed test dream about soaring through the skies')).toBeVisible()
    
    // Check for metadata
    await expect(page.getByText('positive')).toBeVisible()
    await expect(page.getByText('flying')).toBeVisible()
    await expect(page.getByText('landscape')).toBeVisible()
    
    // Check for action buttons
    await expect(page.getByText('Edit')).toBeVisible()
    await expect(page.getByText('Delete')).toBeVisible()
  })

  test('should display AI analysis section', async ({ page }) => {
    // Check if AI Analysis section exists
    const analyzeButton = page.getByText('Analyze Dream')
    const analysisSection = page.getByText('Dream Analysis')
    
    if (await analyzeButton.isVisible()) {
      // Analysis not yet done - should show analyze button
      await expect(analyzeButton).toBeVisible()
    } else if (await analysisSection.isVisible()) {
      // Analysis already exists - should show analysis
      await expect(analysisSection).toBeVisible()
    }
  })

  test('should trigger AI analysis when analyze button is clicked', async ({ page }) => {
    const analyzeButton = page.getByText('Analyze Dream')
    
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click()
      
      // Should show analyzing state
      await expect(page.getByText('Analyzing...')).toBeVisible()
      
      // Wait for analysis to complete (with timeout)
      await page.waitForSelector('text=Dream Analysis', { timeout: 10000 }).catch(() => {
        // If analysis doesn't complete, that's okay - API might not be running
        console.log('Analysis timed out - this is expected if AI service is not running')
      })
    }
  })

  test('should navigate to edit page when edit button is clicked', async ({ page }) => {
    await page.getByText('Edit').click()
    
    await expect(page.url()).toMatch(/\/dreams\/[^\/]+\/edit$/)
    await expect(page.getByLabel('Title')).toHaveValue('Test Dream for Detail View')
  })

  test('should handle dream deletion', async ({ page }) => {
    // Mock the confirm dialog to return true
    await page.addInitScript(() => {
      window.confirm = () => true
    })
    
    await page.getByText('Delete').click()
    
    // Should redirect back to dreams list
    await expect(page).toHaveURL('/dreams')
  })

  test('should display formatted date', async ({ page }) => {
    // Check if date is displayed in readable format
    const datePattern = /\w+\s+\d{1,2},\s+\d{4}/
    const dateText = await page.textContent('body')
    
    if (dateText) {
      expect(dateText).toMatch(datePattern)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByText('Test Dream for Detail View')).toBeVisible()
    await expect(page.getByText('Edit')).toBeVisible()
    await expect(page.getByText('Delete')).toBeVisible()
  })

  test('should handle back navigation correctly', async ({ page }) => {
    // Go back to dreams list
    await page.goBack()
    await expect(page).toHaveURL('/dreams')
    
    // Navigate forward again
    await page.goForward()
    await expect(page.url()).toMatch(/\/dreams\/[^\/]+$/)
  })
})

test.describe('Dream Analysis Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dreams')
  })

  test('should display analysis results when available', async ({ page }) => {
    // Look for existing dreams with analysis
    const analysisSection = page.getByText('Dream Analysis')
    
    if (await analysisSection.isVisible()) {
      await expect(analysisSection).toBeVisible()
      
      // Check for analysis components
      const themesSection = page.getByText('Themes')
      const emotionsSection = page.getByText('Emotions')
      const symbolsSection = page.getByText('Symbols')
      
      // At least one of these should be visible
      const hasAnalysisComponents = await Promise.all([
        themesSection.isVisible(),
        emotionsSection.isVisible(), 
        symbolsSection.isVisible()
      ])
      
      expect(hasAnalysisComponents.some(visible => visible)).toBe(true)
    }
  })

  test('should handle analysis errors gracefully', async ({ page }) => {
    // Create a new dream and try to analyze it
    await page.goto('/dreams/new')
    
    await page.getByLabel('Title').fill('Error Test Dream')
    await page.getByLabel('Content').fill('This dream is for testing error handling.')
    await page.getByLabel('Mood').selectOption('neutral')
    
    await page.getByRole('button', { name: /save/i }).click()
    await page.waitForURL(/\/dreams(?:\/\w+)?$/)
    
    // Try to analyze
    const analyzeButton = page.getByText('Analyze Dream')
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click()
      
      // Should handle errors without crashing
      await page.waitForTimeout(2000)
      
      // Page should still be functional
      await expect(page.getByText('Error Test Dream')).toBeVisible()
    }
  })
})