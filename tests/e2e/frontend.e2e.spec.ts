import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('redirects to notes reader', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveURL(/\/notes$/)

    const heading = page.locator('.note-app__brand h1').first()
    await expect(heading).toHaveText('Seph News')
  })
})
