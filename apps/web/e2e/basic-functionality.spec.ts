import { expect, test } from '@playwright/test'

test.describe('Basic Application Functionality', () => {
  test('should load and display homepage content', async ({ page }) => {
    await page.goto('/')

    // Check main page elements
    await expect(page.getByTestId('homepage-title')).toBeVisible()
    await expect(page.getByText('Unlock the meaning behind your dreams')).toBeVisible()

    // Check feature sections
    await expect(page.getByText('🎤 Voice Recording')).toBeVisible()
    await expect(page.getByText('🤖 AI Analysis')).toBeVisible()
    await expect(page.getByText('📚 Dream Journal')).toBeVisible()
    await expect(page.getByText('🔒 Privacy First')).toBeVisible()
  })

  test('should navigate to dreams page', async ({ page }) => {
    await page.goto('/')

    // Click on Start Analyzing Dreams button
    await page.getByTestId('start-analyzing-button').click()

    // Should be on dreams page
    await expect(page).toHaveURL('/dreams')
    await expect(page.getByTestId('dream-journal-heading')).toBeVisible()
  })

  test('should display dreams page tabs', async ({ page }) => {
    await page.goto('/dreams')

    // Check for main tabs
    await expect(page.getByTestId('tab-dreams')).toBeVisible()
    await expect(page.getByTestId('tab-analytics')).toBeVisible()
    await expect(page.getByTestId('tab-search')).toBeVisible()
    await expect(page.getByTestId('tab-sharing')).toBeVisible()
    await expect(page.getByTestId('tab-preferences')).toBeVisible()
    await expect(page.getByTestId('tab-privacy')).toBeVisible()
  })

  test('should navigate to new dream page', async ({ page }) => {
    await page.goto('/dreams')

    // Find and click Add New Dream button
    await page.getByTestId('add-new-dream-button').click()

    // Should be on new dream page
    await expect(page).toHaveURL('/dreams/new')
    await expect(page.getByText('Record New Dream')).toBeVisible()
  })

  test('should display dream form fields', async ({ page }) => {
    await page.goto('/dreams/new')

    // Check for form elements
    await expect(page.getByText('Dream Title')).toBeVisible()
    await expect(page.getByText('Dream Date')).toBeVisible()
    await expect(page.getByText('Overall Mood')).toBeVisible()
    await expect(page.getByText('Dream Content')).toBeVisible()

    // Check for input fields
    await expect(page.locator('#title')).toBeVisible()
    await expect(page.locator('#content')).toBeVisible()
    await expect(page.locator('#mood')).toBeVisible()
  })

  test('should be able to fill out dream form', async ({ page }) => {
    await page.goto('/dreams/new')

    // Fill out the form
    await page.locator('#title').fill('Test Dream')
    await page.locator('#content').fill('This is a test dream with enough content to pass validation.')
    await page.locator('#mood').selectOption('positive')
    await page.locator('#tags').fill('test, automation')

    // Verify values were entered
    await expect(page.locator('#title')).toHaveValue('Test Dream')
    await expect(page.locator('#content')).toHaveValue('This is a test dream with enough content to pass validation.')
    await expect(page.locator('#mood')).toHaveValue('positive')
    await expect(page.locator('#tags')).toHaveValue('test, automation')
  })
})