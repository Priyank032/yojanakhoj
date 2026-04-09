import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3000';

// Helper: answer one quiz question
async function answerQuestion(page: Page, value: string | number) {
  const type = await page.locator('[data-testid="option-card"]').count()
    .then(c => c > 0 ? 'choice' : 'number').catch(() => 'number');

  if (type === 'choice') {
    // Click the option that matches
    const options = page.locator('button').filter({ hasText: new RegExp(String(value), 'i') }).first();
    if (await options.count() > 0) {
      await options.click();
    } else {
      // Click first available option
      await page.locator('button').filter({ hasText: /\w+/ }).first().click();
    }
  } else {
    const input = page.locator('input[type="number"]');
    if (await input.count() > 0) {
      await input.fill(String(value));
    }
  }
}

test.describe('YojanaKhoj UI Tests', () => {

  test('Landing page loads correctly', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/YojanaKhoj/);
    await expect(page.locator('text=Find My Benefits')).toBeVisible();
    await expect(page.locator('text=Government schemes').first()).toBeVisible();
    await expect(page.locator('text=20+').first()).toBeVisible();
    await expect(page.locator('text=3 min').first()).toBeVisible();
    await expect(page.locator('text=How it works')).toBeVisible();
  });

  test('Navbar renders with logo and language toggle', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('text=YojanaKhoj').first()).toBeVisible();
    await expect(page.locator('button', { hasText: /EN|हिं/ })).toBeVisible();
  });

  test('Language toggle switches EN ↔ Hindi', async ({ page }) => {
    await page.goto(BASE);
    const toggle = page.locator('button', { hasText: /EN|हिं/ });
    const before = await toggle.textContent();
    await toggle.click();
    const after = await toggle.textContent();
    expect(before).not.toBe(after);
  });

  test('CTA navigates to quiz page', async ({ page }) => {
    await page.goto(BASE);
    await page.click('text=Find My Benefits');
    await expect(page).toHaveURL(/\/quiz/);
  });

  test('Quiz page loads first question', async ({ page }) => {
    await page.goto(`${BASE}/quiz`);
    await expect(page.locator('text=Which state')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Question 1 of 12')).toBeVisible();
    await expect(page.locator('text=Uttar Pradesh')).toBeVisible();
  });

  test('Progress bar is visible and starts at 0%', async ({ page }) => {
    await page.goto(`${BASE}/quiz`);
    await page.waitForSelector('text=Question 1');
    await expect(page.locator('text=0% complete')).toBeVisible();
  });

  test('Hindi translation shown below question', async ({ page }) => {
    await page.goto(`${BASE}/quiz`);
    await page.waitForSelector('text=Which state');
    await expect(page.locator('text=आप किस राज्य में रहते हैं')).toBeVisible();
  });

  test('Next button disabled until answer selected', async ({ page }) => {
    await page.goto(`${BASE}/quiz`);
    await page.waitForSelector('text=Which state');
    const nextBtn = page.locator('button', { hasText: 'Next' });
    await expect(nextBtn).toBeDisabled();
  });

  test('Selecting an option enables Next button', async ({ page }) => {
    await page.goto(`${BASE}/quiz`);
    await page.waitForSelector('text=Uttar Pradesh');
    await page.click('text=Uttar Pradesh');
    const nextBtn = page.locator('button', { hasText: 'Next' });
    await expect(nextBtn).toBeEnabled();
  });

  test('Selecting option highlights it with green border', async ({ page }) => {
    await page.goto(`${BASE}/quiz`);
    await page.waitForSelector('text=Rajasthan');
    await page.click('text=Rajasthan');
    const selected = page.locator('button', { hasText: 'Rajasthan' });
    await expect(selected).toHaveClass(/border-green-600/);
  });

  test('Full quiz flow — BPL farmer reaches results page', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(`${BASE}/quiz`);

    // Q1: State
    await page.waitForSelector('text=Which state');
    await page.click('text=Rajasthan');
    await page.click('button:has-text("Next")');

    // Q2: Age
    await page.waitForSelector('text=age');
    await page.fill('input[type="number"]', '42');
    await page.click('button:has-text("Next")');

    // Q3: Gender
    await page.waitForSelector('text=gender');
    await page.click('text=Male');
    await page.click('button:has-text("Next")');

    // Q4: Occupation
    await page.waitForSelector('text=occupation');
    await page.click('text=Farmer');
    await page.click('button:has-text("Next")');

    // Q5: Land holding (farmer branch)
    await page.waitForSelector('text=land');
    await page.fill('input[type="number"]', '2');
    await page.click('button:has-text("Next")');

    // Q6: Income
    await page.waitForSelector('text=income');
    await page.click('text=₹50,000 – ₹1,00,000');
    await page.click('button:has-text("Next")');

    // Q7: Family size
    await page.waitForSelector('text=family');
    await page.fill('input[type="number"]', '5');
    await page.click('button:has-text("Next")');

    // Q8: BPL
    await page.waitForSelector('text=BPL');
    await page.click('text=Yes – BPL');
    await page.click('button:has-text("Next")');

    // Q9: Disability
    await page.waitForSelector('text=disability');
    await page.click('text=No');
    await page.click('button:has-text("Next")');

    // Q10: Caste
    await page.waitForSelector('text=category');
    await page.click('text=OBC');
    await page.click('button:has-text("Next")');

    // Q11: Employment
    await page.waitForSelector('text=employment');
    await page.click('text=Self-employed');
    await page.click('button:has-text("Next")');

    // Wait for results (GPT-4o refinement can take ~20–40s)
    await expect(page).toHaveURL(/\/results/, { timeout: 30000 });
    await expect(page.locator('text=Schemes Found')).toBeVisible({ timeout: 60000 });
  });

  test('Results page shows summary card with scheme count', async ({ page }) => {
    test.setTimeout(120000);

    // Run a quick quiz via API to get sessionId
    const res = await fetch('http://localhost:4000/quiz/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    const { sessionId } = await res.json();

    // Answer minimum required questions
    const answers = [
      ['q_state', 'RJ'], ['q_age', 35], ['q_gender', 'male'],
      ['q_occupation', 'daily_wage'], ['q_income', '0_50000'],
      ['q_family_size', 4], ['q_bpl', 'yes_bpl'], ['q_disability', 'no'],
      ['q_caste', 'sc'], ['q_employment_status', 'unemployed']
    ];

    for (const [qId, answer] of answers) {
      await fetch('http://localhost:4000/quiz/answer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, questionId: qId, answer })
      });
    }

    // Pre-warm match so results page gets cached response instantly
    await fetch('http://localhost:4000/match/schemes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });

    await page.goto(`${BASE}/results?session=${sessionId}`);
    await expect(page.locator('text=Schemes Found')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Estimated annual benefit')).toBeVisible();
    await expect(page.locator('text=Definite').first()).toBeVisible();
    await expect(page.locator('text=Download PDF Report')).toBeVisible();
  });

  test('Scheme detail page renders all 3 tabs', async ({ page }) => {
    await page.goto(`${BASE}/schemes/PM-KISAN-001`);
    await page.waitForSelector('text=PM Kisan', { timeout: 10000 });
    await expect(page.locator('text=What You Get')).toBeVisible();
    await expect(page.locator('text=How to Apply')).toBeVisible();
    await expect(page.locator('text=Documents')).toBeVisible();
  });

  test('How to Apply tab shows numbered steps', async ({ page }) => {
    await page.goto(`${BASE}/schemes/PM-KISAN-001`);
    await page.waitForSelector('text=What You Get');
    await page.click('text=How to Apply');
    await expect(page.locator('text=pmkisan.gov.in').first()).toBeVisible();
    await expect(page.locator('text=Apply Now')).toBeVisible();
  });

  test('Documents tab shows checklist with checkboxes', async ({ page }) => {
    await page.goto(`${BASE}/schemes/PM-KISAN-001`);
    await page.waitForSelector('text=What You Get');
    await page.click('text=Documents');
    await expect(page.locator('text=Aadhaar Card')).toBeVisible();
    await expect(page.locator('text=0 / ')).toBeVisible();
  });

  test('Checking a document marks it as collected', async ({ page }) => {
    await page.goto(`${BASE}/schemes/PM-KISAN-001`);
    await page.waitForSelector('text=What You Get');
    await page.click('text=Documents');
    await page.waitForSelector('text=Aadhaar Card');
    await page.click('text=Aadhaar Card');
    await expect(page.locator('text=1 / ')).toBeVisible({ timeout: 5000 });
  });

  test('Apply Now button has correct href', async ({ page }) => {
    await page.goto(`${BASE}/schemes/PM-KISAN-001`);
    await page.waitForSelector('text=Apply Now');
    const link = page.locator('a', { hasText: 'Apply Now' });
    const href = await link.getAttribute('href');
    expect(href).toContain('pmkisan.gov.in');
  });

  test('Back button returns to previous page', async ({ page }) => {
    await page.goto(`${BASE}/schemes/PMJAY-001`);
    await page.waitForSelector('text=← All Results');
    await page.click('text=← All Results');
    // Should navigate back
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain('/schemes/PMJAY-001');
  });
});
