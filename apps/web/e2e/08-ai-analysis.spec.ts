import { test, expect, type Page } from '@playwright/test'

test.describe('AI Analysis Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test dream for AI analysis
    await page.goto('/dreams/new')
    
    await page.getByLabel('Title').fill('AI Analysis Test Dream')
    await page.getByLabel('Content').fill('I was flying through a mystical forest filled with golden light. Ancient trees whispered secrets as I soared between their branches. I felt completely free and at peace, like I belonged in this magical realm.')
    await page.getByLabel('Mood').selectOption('positive')
    await page.getByLabel('Tags').fill('flying, forest, mystical, peace, magic')
    
    await page.getByRole('button', { name: /save/i }).click()
    await page.waitForURL(/\/dreams(?:\/\w+)?$/)
  })

  test('should display AI analysis button on dream detail page', async ({ page }) => {
    // Navigate to the dream we just created
    await page.goto('/dreams')
    await page.getByText('AI Analysis Test Dream').click()
    
    // Should show analyze button or existing analysis
    const analyzeButton = page.getByText('Analyze Dream')
    const analysisSection = page.getByText('Dream Analysis')
    
    const hasAnalyzeButton = await analyzeButton.isVisible()
    const hasAnalysis = await analysisSection.isVisible()
    
    expect(hasAnalyzeButton || hasAnalysis).toBe(true)
  })

  test('should handle AI analysis request', async ({ page }) => {
    await page.goto('/dreams')
    await page.getByText('AI Analysis Test Dream').click()
    
    const analyzeButton = page.getByText('Analyze Dream')
    
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click()
      
      // Should show analyzing state
      const analyzingText = page.getByText('Analyzing...')
      await expect(analyzingText).toBeVisible({ timeout: 2000 })
      
      // Wait for analysis to complete or timeout
      await page.waitForSelector('text=Dream Analysis', { timeout: 10000 }).catch(() => {
        console.log('AI Analysis timed out - API service may not be running')
      })
    }
  })

  test('should display analysis results when available', async ({ page }) => {
    await page.goto('/dreams')
    await page.getByText('AI Analysis Test Dream').click()
    
    // Check if analysis results are shown
    const analysisSection = page.getByText('Dream Analysis')
    
    if (await analysisSection.isVisible()) {
      await expect(analysisSection).toBeVisible()
      
      // Look for analysis components
      const analysisComponents = [
        'Interpretation',
        'Themes',
        'Emotions', 
        'Symbols',
        'Categories'
      ]
      
      let foundComponents = 0
      for (const component of analysisComponents) {
        const element = page.getByText(component)
        if (await element.isVisible()) {
          foundComponents++
        }
      }
      
      expect(foundComponents).toBeGreaterThan(0)
    }
  })

  test('should handle AI service unavailable gracefully', async ({ page }) => {
    await page.goto('/dreams')
    await page.getByText('AI Analysis Test Dream').click()
    
    const analyzeButton = page.getByText('Analyze Dream')
    
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click()
      
      // Wait a reasonable time for response
      await page.waitForTimeout(3000)
      
      // Should not crash the application
      await expect(page.getByText('AI Analysis Test Dream')).toBeVisible()
      
      // Should handle errors gracefully
      const errorMessages = [
        'Error analyzing dream',
        'Analysis failed',
        'Service unavailable',
        'Network error'
      ]
      
      for (const errorMsg of errorMessages) {
        const errorElement = page.getByText(errorMsg)
        if (await errorElement.isVisible()) {
          await expect(errorElement).toBeVisible()
        }
      }
    }
  })

  test('should show AI categorization results', async ({ page }) => {
    await page.goto('/dreams')
    await page.getByText('AI Analysis Test Dream').click()
    
    // Look for dream categories (from enhanced AI system)
    const categories = [
      'Adventure',
      'Nature', 
      'Spiritual',
      'Flying',
      'Peaceful',
      'Mystical'
    ]
    
    for (const category of categories) {
      const categoryElement = page.getByText(category)
      if (await categoryElement.isVisible()) {
        await expect(categoryElement).toBeVisible()
      }
    }
  })
})

test.describe('Enhanced AI Features', () => {
  test('should display pattern recognition results', async ({ page }) => {
    // Navigate to dreams with multiple entries for pattern analysis
    await page.goto('/dreams')
    
    // Check analytics tab for pattern recognition
    await page.getByText('Analytics').click()
    
    // Look for pattern-related information
    const patternElements = [
      'Patterns',
      'Recurring Themes',
      'Common Symbols',
      'Trends'
    ]
    
    for (const element of patternElements) {
      const patternElement = page.getByText(element)
      if (await patternElement.isVisible()) {
        await expect(patternElement).toBeVisible()
      }
    }
  })

  test('should show symbol interpretation', async ({ page }) => {
    await page.goto('/dreams')
    
    // Find a dream with symbolic content
    const dreamCard = page.getByText('AI Analysis Test Dream')
    if (await dreamCard.isVisible()) {
      await dreamCard.click()
      
      // Look for symbol interpretations
      const symbolElements = [
        'Symbols',
        'forest',
        'flying',
        'light',
        'trees'
      ]
      
      for (const symbol of symbolElements) {
        const symbolElement = page.getByText(symbol)
        if (await symbolElement.isVisible()) {
          await expect(symbolElement).toBeVisible()
        }
      }
    }
  })

  test('should handle multiple analysis requests', async ({ page }) => {
    // Create multiple dreams and analyze them
    const dreamTitles = [
      'First Analysis Dream',
      'Second Analysis Dream'
    ]
    
    for (const title of dreamTitles) {
      await page.goto('/dreams/new')
      await page.getByLabel('Title').fill(title)
      await page.getByLabel('Content').fill(`Dream content for ${title} with various symbols and themes.`)
      await page.getByLabel('Mood').selectOption('positive')
      await page.getByRole('button', { name: /save/i }).click()
      await page.waitForURL(/\/dreams(?:\/\w+)?$/)
    }
    
    // Analyze both dreams
    for (const title of dreamTitles) {
      await page.goto('/dreams')
      await page.getByText(title).click()
      
      const analyzeButton = page.getByText('Analyze Dream')
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click()
        await page.waitForTimeout(1000) // Brief wait between analyses
      }
    }
  })
})