import { expect, test, type Page } from '@playwright/test';

/** The main path of the one-week story, from a first visit with no saved data. */

async function answerVisibleQuestion(page: Page) {
  const radio = page.getByRole('radio').first();
  if (await radio.count()) await radio.check();
  else await page.getByLabel('Your answer').fill('1234');
}

test('onboarding → daily set → result → review → planner → streak', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  // Landing and onboarding.
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('one good day at a time');
  await expect(page.getByText(/Pace is a concept redesign by Team Apex/)).toBeVisible();
  await page.getByRole('link', { name: 'Start preparing' }).click();

  await page.getByLabel('Your name').fill('Riya');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: '45 min' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();

  // Home with a first plan, and a streak at zero.
  await expect(page).toHaveURL(/#\/home/);
  await expect(page.getByText(/Riya/)).toBeVisible();
  await expect(page.getByRole('heading', { name: "Today's plan" })).toBeVisible();
  await expect(page.getByRole('link', { name: /Streak 0 days/ })).toBeVisible();

  // Build a daily set on RC so the review has a passage with vocabulary words.
  await page.goto('/#/practice/daily');
  await page.getByRole('button', { name: 'Reading comprehension' }).click();
  await page.getByRole('button', { name: '5', exact: true }).click();
  await expect(page.getByText(/5 questions · 20 min/)).toBeVisible();
  await page.getByRole('button', { name: 'Start set' }).click();

  // Test window: answer two, then submit.
  await expect(page.getByRole('timer')).toBeVisible();
  await answerVisibleQuestion(page);
  await page.getByRole('button', { name: 'Save & next' }).click();
  await answerVisibleQuestion(page);
  await page.getByRole('button', { name: 'Submit test' }).click();
  await expect(page.getByRole('dialog')).toContainText('2 answered');
  await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();

  // Result.
  await expect(page.getByRole('heading', { name: 'Your result' })).toBeVisible();
  await page.getByRole('link', { name: 'Review answers' }).click();

  // Review: option percentages are tagged, a vocabulary card opens, a community answer saves.
  await expect(page.getByText('Sample data').first()).toBeVisible();
  await expect(page.getByText(/attempts · \d+% correct/)).toBeVisible();
  await page.locator('.vw-btn').first().click();
  await expect(page.getByRole('dialog').getByText('With the simpler word')).toBeVisible();
  await page.getByRole('button', { name: 'Add to my words' }).click();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('tab', { name: /Community/ }).click();
  await page.getByLabel('Add your answer').fill('I went back to the second paragraph and the line was right there.');
  await page.getByRole('button', { name: 'Post answer' }).click();
  await expect(page.getByText('I went back to the second paragraph')).toBeVisible();

  // Planner quick-add, with a preview before saving.
  await page.goto('/#/progress/planner');
  const quick = page.getByPlaceholder('Try: DILR sets 7pm 45m');
  await quick.fill('DILR sets tomorrow 7pm 45m');
  await expect(page.getByText(/DILR sets/).first()).toBeVisible();
  await quick.press('Enter');
  await expect(quick).toHaveValue('');
  await expect(page.getByText('DILR sets').first()).toBeVisible();

  // Streak updated from what was actually done.
  await page.goto('/#/progress/streak');
  await expect(page.getByRole('link', { name: /Streak 1 day\b/ })).toBeVisible();
  await expect(page.getByText(/2 questions/).first()).toBeVisible();

  // Coins came from real actions, and everything survives a reload.
  await page.reload();
  await expect(page.getByRole('link', { name: /Streak 1 day\b/ })).toBeVisible();
  expect(errors).toEqual([]);
});
