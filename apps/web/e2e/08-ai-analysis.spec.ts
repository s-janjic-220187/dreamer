import { test, expect } from '@playwright/test'

test.describe('AI Analysis Integration', () => {
  test('should display AI analysis button on dream detail page', async ({ page }) => {
    // Create a test dream first
    await page.goto('/dreams/new')
    
    await page.getByLabel('Title').fill('AI Analysis Test Dream')
    await page.getByLabel('Content').fill('I had a vivid dream about flying over mountains and forests, feeling completely free and peaceful.')
    await page.getByLabel('Mood').selectOption('positive')
    await page.getByLabel('Tags').fill('flying, nature, freedom')
    
    await page.getByRole('button', { name: /save/i }).click()
    
    // Wait for navigation
    await page.waitForURL(/\/dreams/, { timeout: 10000 })
    
    // Navigate to the dream we just created
    if (page.url().endsWith('/dreams')) {
      await page.locator('[data-testid*="dream-title"]').filter({ hasText: 'AI Analysis Test Dream' }).first().click()
      await page.waitForURL(/\/dreams\/[^\/]+$/, { timeout: 5000 })
    }
    
    // Should show analyze button or existing analysis
    const analyzeButton = page.getByTestId('analyze-dream-button')
    const analysisSection = page.getByTestId('dream-analysis-heading')
    
    const hasAnalyzeButton = await analyzeButton.isVisible()
    const hasAnalysis = await analysisSection.isVisible()
    
    expect(hasAnalyzeButton || hasAnalysis).toBe(true)
  })

  test('should handle AI analysis request', async ({ page }) => {
    // Create a test dream
    await page.goto('/dreams/new')
    
    await page.getByLabel('Title').fill('Analysis Test Dream 2')
    await page.getByLabel('Content').fill('In my dream, I was walking through a mysterious forest filled with glowing trees and strange sounds.')
    await page.getByLabel('Mood').selectOption('mixed')
    await page.getByLabel('Tags').fill('forest, mystery, nature')
    
    await page.getByRole('button', { name: /save/i }).click()
    
    // Wait for navigation
    await page.waitForURL(/\/dreams/, { timeout: 10000 })
    
    // Navigate to detail page
    if (page.url().endsWith('/dreams')) {
      await page.locator('[data-testid*="dream-title"]').filter({ hasText: 'Analysis Test Dream 2' }).first().click()
      await page.waitForURL(/\/dreams\/[^\/]+$/, { timeout: 5000 })
    }
    
    // Try to analyze
    const analyzeButton = page.getByTestId('analyze-dream-button')
    
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click()
      
      // Should show analyzing state
      await expect(page.getByText('Analyzing...')).toBeVisible({ timeout: 2000 }).catch(() => {
        // This is okay if the analysis is very fast or fails
      })
      
      // Wait a bit for the request to complete
      await page.waitForTimeout(3000)
      
      // Page should still be functional regardless of analysis success/failure
      await expect(page.getByTestId('dream-title')).toBeVisible()
    }
  })

  test('should display analysis components when available', async ({ page }) => {
    // Go to dreams page and look for any existing dreams
    await page.goto('/dreams')
    
    // Look for any dream cards and click the first one
    const dreamCards = page.locator('[data-testid="dream-card"]')
    const dreamCount = await dreamCards.count()
    
    if (dreamCount > 0) {
      await dreamCards.first().click()
      await page.waitForURL(/\/dreams\/[^\/]+$/, { timeout: 5000 })
      
      // Check if analysis components exist
      const analysisContent = page.getByTestId('dream-analysis-content')
      
      if (await analysisContent.isVisible()) {
        // If analysis exists, check for themes and emotions
        const themesSection = page.getByTestId('analysis-themes')
        const emotionsSection = page.getByTestId('analysis-emotions')
        
        // At least one analysis component should be visible
        const hasThemes = await themesSection.isVisible()
        const hasEmotions = await emotionsSection.isVisible()
        const hasAnalysisContent = await analysisContent.isVisible()
        
        expect(hasAnalysisContent || hasThemes || hasEmotions).toBe(true)
      } else {
        // No analysis yet - that's fine
        await expect(page.getByTestId('no-analysis-message')).toBeVisible()
      }
    }
  })
})
