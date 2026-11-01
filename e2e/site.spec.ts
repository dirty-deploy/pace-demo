import { expect, test, type Page } from '@playwright/test';

const CREDIT = /Pace is a concept redesign by Team Apex/;

const ROUTES = [
  '/',
  '/start',
  '/about',
  '/home',
  '/practice/daily',
  '/practice/tests',
  '/practice/tests?tab=sectional',
  '/practice/tests?tab=topic',
  '/practice/drill',
  '/learn/lessons',
  '/learn/lessons/rc-inference',
  '/learn/notes',
  '/learn/vocab',
  '/progress/review',
  '/progress/analytics',
  '/progress/planner',
  '/progress/streak',
  '/community',
  '/rewards',
  '/settings',
  '/more',
  '/test/mock-1',
  '/test/mock-1/result',
];

async function demo(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore with a demo profile' }).click();
  await page.waitForURL('**/#/home');
}

/** Edits saved state and reloads. Call from outside the test window, which saves on pagehide. */
async function patch(page: Page, fn: string) {
  await page.evaluate((src) => {
    const s = JSON.parse(localStorage.getItem('pace.v2') as string);
    new Function('s', src)(s);
    localStorage.setItem('pace.v2', JSON.stringify(s));
  }, fn);
  await page.reload();
}

test('every route has content and the credit, and every link goes somewhere real', async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await demo(page);
  const seen = new Set<string>();
  const queue = [...ROUTES];
  while (queue.length) {
    const route = queue.shift() as string;
    if (seen.has(route)) continue;
    seen.add(route);
    await page.goto(`/#${route}`);
    await page.getByText(CREDIT).first().waitFor({ timeout: 8000 });
    const url = new URL(page.url()).hash.slice(1);
    if (route !== '/') expect(url, `${route} redirected away`).not.toBe('/');
    const text = await page.locator('body').innerText();
    expect(text.length, `${route} is empty`).toBeGreaterThan(120);
    expect(text, `${route} has no credit`).toMatch(CREDIT);
    expect(text, route).not.toMatch(/coming soon|lorem ipsum|\bTODO\b|undefined|\bNaN\b/i);
    const links = await page.locator('a[href^="#/"]').evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('href') as string));
    for (const href of links) {
      const next = href.slice(1);
      // One example of each dynamic family is enough; there are hundreds of attempt links.
      const known = [...seen, ...queue].some((r) => r.split('/').slice(0, 4).join('/') === next.split('/').slice(0, 4).join('/'));
      if (!seen.has(next) && !queue.includes(next) && !known) queue.push(next);
    }
  }
  expect(seen.size).toBeGreaterThanOrEqual(ROUTES.length);
  expect(errors).toEqual([]);
});

test('sample data is tagged wherever other students appear', async ({ page }) => {
  await demo(page);
  for (const route of ['/learn/notes', '/community']) {
    await page.goto(`/#${route}`);
    await expect(page.getByText('Sample data').first(), route).toBeVisible();
  }
  await page.goto('/#/progress/review');
  await page.getByRole('link', { name: /Full mock 1/ }).click();
  await page.getByRole('tab', { name: /Questions/ }).click();
  await expect(page.getByText('Sample data').first()).toBeVisible();
  await page.getByRole('tab', { name: /Community/ }).click();
  await expect(page.getByText('Sample data').first()).toBeVisible();
  await expect(page.getByText(/^Sample (student|alum)/).first()).toBeVisible();
});

test('mock sections lock, then move on when the clock runs out', async ({ page }) => {
  await demo(page);
  await page.goto('/#/test/mock-2');
  await page.getByRole('button', { name: 'Start test' }).click();
  await expect(page.getByRole('button', { name: 'Pause' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Submit test' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Next section' })).toBeDisabled();
  await expect(page.getByText(/Section ends in/)).toBeVisible();

  await page.getByRole('radio').first().check();
  await page.goto('/#/home');
  await expect(page.getByText(/Full mock 2 · 1 answered/)).toBeVisible();
  await patch(page, "s.active['mock-2'].secondsLeft[0] = 3;");
  await page.goto('/#/test/mock-2');
  await expect(page.getByText(/Section 2 of 3/)).toBeVisible({ timeout: 12_000 });

  // The next section can't be left early either; the final one can be submitted.
  await expect(page.getByRole('button', { name: 'Next section' })).toBeDisabled();
  await page.goto('/#/home');
  await patch(page, "s.active['mock-2'].secondsLeft[1] = 3;");
  await page.goto('/#/test/mock-2');
  await expect(page.getByText(/Section 3 of 3/)).toBeVisible({ timeout: 12_000 });
  await expect(page.getByRole('button', { name: 'Submit test' })).toBeVisible();

  // QA has the calculator.
  await page.getByRole('button', { name: 'Calculator' }).click();
  const calc = page.getByRole('region', { name: 'Calculator' });
  for (const k of ['1', '2', '×', '3', '=']) await calc.getByRole('button', { name: k, exact: true }).click();
  await expect(calc.locator('output')).toHaveText('36');
});

test('a test resumes after reload, and practice can pause', async ({ page }) => {
  await demo(page);
  await page.goto('/#/test/sec-qa-2');
  await page.getByRole('button', { name: 'Start test' }).click();
  const first = page.getByRole('radio').first();
  if (await first.count()) await first.check();
  else await page.getByLabel('Your answer').fill('12');
  await page.getByRole('button', { name: 'Mark for review & next' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Question 2 of 22' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Question 1, Answered and marked/ })).toBeVisible();

  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('dialog')).toContainText('The clock has stopped');
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('the word card stays usable when the page scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 620 });
  await demo(page);
  await page.goto('/#/progress/review');
  await page.getByRole('link', { name: /Full mock 1/ }).click();
  await page.getByRole('tab', { name: /Questions/ }).click();
  await page.getByRole('button', { name: /^Question 1,/ }).click();
  await page.locator('.vw-btn').first().click();
  const card = page.getByRole('dialog');
  await expect(card.getByText('With the simpler word')).toBeVisible();
  await page.mouse.wheel(0, 60);
  await page.waitForTimeout(150);
  await expect(card).toBeVisible();
  const box = await card.boundingBox();
  expect(box && box.y >= 0 && box.y + box.height <= 620).toBe(true);
  await page.getByRole('button', { name: 'Add to my words' }).click();
  await expect(card.getByText(/My words/)).toBeVisible();
});

test('Mock 2 stays locked for a new student until Mock 1 or 100 coins', async ({ page }) => {
  await demo(page);
  await page.goto('/#/home');
  await patch(page, "s.attempts = []; s.active = {}; s.purchases.mockUnlocked = false;");
  await page.goto('/#/test/mock-2');
  await expect(page.getByRole('heading', { name: /opens after Mock 1/ })).toBeVisible();
  await page.goto('/#/rewards');
  await page.getByRole('button', { name: 'Buy for 100 coins' }).click();
  await page.goto('/#/test/mock-2');
  await expect(page.getByRole('button', { name: 'Start test' })).toBeVisible();
});

test('DILR sectional offers a set order first, and the drill and cap flow finish', async ({ page }) => {
  await demo(page);
  await page.goto('/#/test/sec-dilr-3');
  await page.getByRole('button', { name: /Pick your order first/ }).click();
  await page.getByRole('button', { name: /down$/ }).first().click();
  await page.getByRole('button', { name: 'Start with this order' }).click();
  await expect(page.getByText(/Set time/)).toBeVisible();
  await page.getByRole('button', { name: 'Submit test' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Your result' })).toBeVisible();

  await page.goto('/#/practice/drill');
  await page.getByRole('button', { name: 'Lock in my order' }).click();
  await expect(page.getByText(/agreed with the recommended order/)).toBeVisible();
  await page.getByRole('button', { name: 'Try the recommended first set' }).click();
  await expect(page.getByText(/Set time/)).toBeVisible();
});

test('redo links, coupons and shields work', async ({ page }) => {
  await demo(page);
  await page.goto('/#/progress/review');
  await page.getByRole('link', { name: /DILR sectional 1/ }).click();
  await page.getByRole('button', { name: 'Add to plan' }).click();
  await page.getByRole('button', { name: 'Redo now' }).first().click();
  await expect(page.getByText(/^Redo:/)).toBeVisible();

  await page.goto('/#/rewards');
  await page.getByRole('button', { name: 'Get a demo coupon' }).click();
  await expect(page.getByText(/MER-[A-Z2-9]{4}-[A-Z2-9]{4}/).first()).toBeVisible();
  await expect(page.getByText('Proposal for after the acquisition. Illustrative: no real coupon.')).toBeVisible();
  await page.getByRole('button', { name: 'Buy for 40 coins' }).click();
  await expect(page.getByText('Streak shields held').locator('..')).toContainText('1');
});

test('works with storage blocked', async ({ page }) => {
  await page.addInitScript(() => {
    const block = () => {
      throw new Error('blocked');
    };
    Object.defineProperty(window, 'localStorage', { get: block });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore with a demo profile' }).click();
  await expect(page.getByText(/Good (morning|afternoon|evening), Ash/)).toBeVisible();
});
