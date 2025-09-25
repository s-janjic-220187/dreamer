import { test, expect, type Page } from '@playwright/test'

test.describe('End-to-End User Workflows', () => {
  test('should complete full dream journal workflow', async ({ page }) => {
    // 1. Start from homepage
    await page.goto('/')
    await expect(page.getByText('Welcome to Dream Analyzer')).toBeVisible()
    
    // 2. Navigate to dreams
    await page.getByRole('link', { name: /start analyzing dreams/i }).click()
    await expect(page).toHaveURL('/dreams')
    
    // 3. Create a new dream
    await page.getByText('Add New Dream').click()
    await expect(page).toHaveURL('/dreams/new')
    
    const dreamTitle = `E2E Test Dream ${Date.now()}`
    await page.getByLabel('Title').fill(dreamTitle)
    await page.getByLabel('Content').fill('This is an end-to-end test dream. I was walking through a beautiful garden filled with colorful flowers and singing birds. The sun was warm and everything felt peaceful and serene.')
    await page.getByLabel('Mood').selectOption('positive')
    await page.getByLabel('Tags').fill('garden, peaceful, flowers, birds, sun')
    
    // 4. Save the dream
    await page.getByRole('button', { name: /save/i }).click()
    await page.waitForURL(/\/dreams(?:\/\w+)?$/)
    
    // 5. Navigate back to dreams list to find our dream
    await page.goto('/dreams')
    await expect(page.getByText(dreamTitle)).toBeVisible()
    
    // 6. View the dream details
    await page.getByText(dreamTitle).click()
    await expect(page.getByText('This is an end-to-end test dream')).toBeVisible()
    
    // 7. Try AI analysis if available
    const analyzeButton = page.getByText('Analyze Dream')
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click()
      await page.waitForTimeout(2000) // Wait for analysis
    }
    
    // 8. Edit the dream
    await page.getByText('Edit').click()
    await expect(page.url()).toMatch(/\/dreams\/[^\/]+\/edit$/)
    
    await page.getByLabel('Title').fill(dreamTitle + ' - Updated')
    await page.getByRole('button', { name: /save/i }).click()
    
    // 9. Verify update
    await page.waitForURL(/\/dreams(?:\/\w+)?$/)
    await expect(page.getByText(dreamTitle + ' - Updated')).toBeVisible()
    
    // 10. Delete the dream (cleanup)
    await page.addInitScript(() => {
      window.confirm = () => true
    })
    
    await page.getByText('Delete').click()
    await expect(page).toHaveURL('/dreams')
  })

  test('should explore all main features systematically', async ({ page }) => {
    await page.goto('/')
    
    // 1. Explore homepage
    await expect(page.getByText('🎤 Voice Recording')).toBeVisible()
    await expect(page.getByText('🤖 AI Analysis')).toBeVisible()
    await expect(page.getByText('📚 Dream Journal')).toBeVisible()
    await expect(page.getByText('🔒 Privacy First')).toBeVisible()
    
    // 2. Navigate to dreams page
    await page.getByRole('link', { name: /view dream journal/i }).click()
    await expect(page).toHaveURL('/dreams')
    
    // 3. Explore all tabs
    const tabs = ['Dreams', 'Analytics', 'Search', 'Sharing', 'Preferences', 'Privacy']
    
    for (const tab of tabs) {
      await page.getByText(tab).click()
      await page.waitForTimeout(500) // Allow tab to load
      
      // Verify tab content loads
      switch (tab) {
        case 'Dreams':
          await expect(page.getByText('Add New Dream')).toBeVisible()
          break
        case 'Analytics':
          await expect(page.getByText('Dream Analytics Dashboard')).toBeVisible()
          break
        case 'Search':
          await expect(page.getByText('Advanced Dream Search')).toBeVisible()
          break
        case 'Sharing':
          await expect(page.getByText('Dream Sharing Features')).toBeVisible()
          break
        case 'Preferences':
          await expect(page.getByText('User Preference System')).toBeVisible()
          break
        case 'Privacy':
          await expect(page.getByText('Privacy Controls')).toBeVisible()
          break
      }
    }
    
    // 4. Test search functionality
    await page.getByText('Search').click()
    const searchInput = page.getByPlaceholder('Search dreams...')
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await searchInput.press('Enter')
      await page.waitForTimeout(500)
    }
    
    // 5. Test analytics
    await page.getByText('Analytics').click()
    await expect(page.getByText('Dream Analytics Dashboard')).toBeVisible()
    
    // 6. Test privacy controls
    await page.getByText('Privacy').click()
    await expect(page.getByText('Privacy Controls')).toBeVisible()
  })

  test('should handle user journey with multiple dreams', async ({ page }) => {
    await page.goto('/dreams')
    
    // Create multiple test dreams
    const dreamData = [
      {
        title: 'Flying Dream E2E Test 1',
        content: 'I was soaring high above the clouds, feeling completely free and weightless.',
        mood: 'positive',
        tags: 'flying, freedom, clouds'
      },
      {
        title: 'Ocean Dream E2E Test 2', 
        content: 'I was swimming in crystal clear ocean waters with tropical fish all around me.',
        mood: 'positive',
        tags: 'ocean, swimming, fish'
      },
      {
        title: 'City Dream E2E Test 3',
        content: 'I was walking through a bustling city at night, neon lights reflecting on wet streets.',
        mood: 'neutral',
        tags: 'city, night, lights'
      }
    ]
    
    // Create each dream
    for (const dream of dreamData) {
      await page.getByText('Add New Dream').click()
      await page.getByLabel('Title').fill(dream.title)
      await page.getByLabel('Content').fill(dream.content)
      await page.getByLabel('Mood').selectOption(dream.mood)
      await page.getByLabel('Tags').fill(dream.tags)
      await page.getByRole('button', { name: /save/i }).click()
      
      await page.waitForURL(/\/dreams(?:\/\w+)?$/)
      await page.goto('/dreams') // Return to dreams list
    }
    
    // Verify all dreams are created
    for (const dream of dreamData) {
      await expect(page.getByText(dream.title)).toBeVisible()
    }
    
    // Test analytics with multiple dreams
    await page.getByText('Analytics').click()
    await expect(page.getByText('Dream Analytics Dashboard')).toBeVisible()
    
    // Test search with multiple dreams
    await page.getByText('Search').click()
    const searchInput = page.getByPlaceholder('Search dreams...')
    if (await searchInput.isVisible()) {
      await searchInput.fill('flying')
      await page.waitForTimeout(500)
    }
    
    // Cleanup - delete test dreams
    await page.addInitScript(() => {
      window.confirm = () => true
    })
    
    for (const dream of dreamData) {
      await page.goto('/dreams')
      const dreamCard = page.getByText(dream.title)
      if (await dreamCard.isVisible()) {
        await dreamCard.click()
        
        const deleteButton = page.getByText('Delete')
        if (await deleteButton.isVisible()) {
          await deleteButton.click()
        }
      }
    }
  })
})

test.describe('Integration Testing', () => {
  test('should maintain state across navigation', async ({ page }) => {
    await page.goto('/dreams/new')
    
    // Fill form partially
    await page.getByLabel('Title').fill('State Test Dream')
    await page.getByLabel('Content').fill('Testing state persistence across navigation.')
    
    // Navigate away and back
    await page.goto('/dreams')
    await page.goto('/dreams/new')
    
    // Form should be reset (new form)
    await expect(page.getByLabel('Title')).toHaveValue('')
  })

  test('should handle concurrent user actions', async ({ page }) => {
    await page.goto('/dreams')
    
    // Simulate rapid interactions
    const promises = [
      page.getByText('Analytics').click(),
      page.getByText('Search').click(),
      page.getByText('Dreams').click()
    ]
    
    // Execute actions concurrently
    await Promise.all(promises.map(p => p.catch(() => {})))
    
    // App should remain stable
    await expect(page.getByText('Dream Journal')).toBeVisible()
  })

  test('should validate data consistency', async ({ page }) => {
    // Create a dream with specific data
    await page.goto('/dreams/new')
    
    const testTitle = 'Data Consistency Test'
    const testContent = 'This dream tests data consistency across the application.'
    
    await page.getByLabel('Title').fill(testTitle)
    await page.getByLabel('Content').fill(testContent)
    await page.getByLabel('Mood').selectOption('neutral')
    await page.getByRole('button', { name: /save/i }).click()
    
    await page.waitForURL(/\/dreams(?:\/\w+)?$/)
    
    // Verify data appears correctly in different views
    await page.goto('/dreams')
    await expect(page.getByText(testTitle)).toBeVisible()
    
    // Check in detail view
    await page.getByText(testTitle).click()
    await expect(page.getByText(testContent)).toBeVisible()
    
    // Check in edit view
    await page.getByText('Edit').click()
    await expect(page.getByLabel('Title')).toHaveValue(testTitle)
    await expect(page.getByLabel('Content')).toHaveValue(testContent)
    
    // Cleanup
    await page.addInitScript(() => {
      window.confirm = () => true
    })
    await page.goBack()
    await page.getByText('Delete').click()
  })
})