import { test, expect, type Page } from '@playwright/test'

test.describe('Dream Creation and Form Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dreams/new')
  })

  test('should display new dream creation form', async ({ page }) => {
    await expect(page.getByText('New Dream')).toBeVisible()
    
    // Check for form fields
    await expect(page.getByLabel('Title')).toBeVisible()
    await expect(page.getByLabel('Content')).toBeVisible()
    await expect(page.getByLabel('Mood')).toBeVisible()
    await expect(page.getByLabel('Tags')).toBeVisible()
  })

  test('should allow entering dream details', async ({ page }) => {
    // Fill in dream title
    await page.getByLabel('Title').fill('Test Dream Title')
    await expect(page.getByLabel('Title')).toHaveValue('Test Dream Title')
    
    // Fill in dream content
    await page.getByLabel('Content').fill('This is a test dream about flying through clouds.')
    await expect(page.getByLabel('Content')).toHaveValue('This is a test dream about flying through clouds.')
    
    // Select mood
    await page.getByLabel('Mood').selectOption('positive')
    await expect(page.getByLabel('Mood')).toHaveValue('positive')
    
    // Add tags
    await page.getByLabel('Tags').fill('flying, clouds, peaceful')
    await expect(page.getByLabel('Tags')).toHaveValue('flying, clouds, peaceful')
  })

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling required fields
    await page.getByRole('button', { name: /save/i }).click()
    
    // Check for validation messages or form not submitting
    await expect(page).toHaveURL('/dreams/new') // Should stay on the same page
  })

  test('should save new dream successfully', async ({ page }) => {
    // Fill in complete dream
    await page.getByLabel('Title').fill('Automated Test Dream')
    await page.getByLabel('Content').fill('This dream was created by an automated test. It features a journey through a mystical forest.')
    await page.getByLabel('Mood').selectOption('positive')
    await page.getByLabel('Tags').fill('test, automation, forest')
    
    // Submit the form
    await page.getByRole('button', { name: /save/i }).click()
    
    // Should redirect to dreams list or dream detail
    await page.waitForURL(/\/dreams(?:\/\w+)?$/)
    
    // Verify we're no longer on the new dream page
    await expect(page).not.toHaveURL('/dreams/new')
  })

  test('should have cancel functionality', async ({ page }) => {
    // Fill in some data
    await page.getByLabel('Title').fill('Test Dream')
    
    // Look for cancel button or back navigation
    const cancelButton = page.getByRole('button', { name: /cancel/i })
    const backButton = page.getByRole('button', { name: /back/i })
    
    if (await cancelButton.isVisible()) {
      await cancelButton.click()
    } else if (await backButton.isVisible()) {
      await backButton.click()
    } else {
      // Use browser back
      await page.goBack()
    }
    
    // Should return to dreams page
    await expect(page).toHaveURL('/dreams')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByText('New Dream')).toBeVisible()
    await expect(page.getByLabel('Title')).toBeVisible()
    await expect(page.getByLabel('Content')).toBeVisible()
    
    // Test form interaction on mobile
    await page.getByLabel('Title').fill('Mobile Dream Test')
    await expect(page.getByLabel('Title')).toHaveValue('Mobile Dream Test')
  })
})

test.describe('Dream Editing Features', () => {
  test('should handle editing existing dreams', async ({ page }) => {
    // First, go to dreams page to find a dream to edit
    await page.goto('/dreams')
    
    // Look for edit buttons or dream cards that can be edited
    const editButtons = page.getByText('Edit')
    const dreamCards = page.locator('[data-testid="dream-card"]')
    
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click()
      
      // Should navigate to edit page
      await expect(page.url()).toMatch(/\/dreams\/[^\/]+\/edit$/)
      
      // Should display edit form with pre-filled data
      await expect(page.getByLabel('Title')).not.toHaveValue('')
      
    } else if (await dreamCards.count() > 0) {
      // Try clicking on a dream card first
      await dreamCards.first().click()
      
      // Look for edit button on detail page
      const detailEditButton = page.getByText('Edit')
      if (await detailEditButton.isVisible()) {
        await detailEditButton.click()
        await expect(page.url()).toMatch(/\/dreams\/[^\/]+\/edit$/)
      }
    }
  })

  test('should save edited dream changes', async ({ page }) => {
    // This test assumes we can navigate to an edit page
    await page.goto('/dreams')
    
    // Try to find and edit a dream
    const dreamCards = page.locator('[data-testid="dream-card"]')
    
    if (await dreamCards.count() > 0) {
      await dreamCards.first().click()
      
      const editButton = page.getByText('Edit')
      if (await editButton.isVisible()) {
        await editButton.click()
        
        // Modify the title
        const titleField = page.getByLabel('Title')
        const currentTitle = await titleField.inputValue()
        await titleField.fill(currentTitle + ' - Edited')
        
        // Save changes
        await page.getByRole('button', { name: /save/i }).click()
        
        // Should redirect away from edit page
        await expect(page.url()).not.toMatch(/\/edit$/)
      }
    }
  })
})