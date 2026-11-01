// Captures the key screens at 1440x900 and 390x844 into screenshots/, with the demo profile.
// Uses a fixed "today" of 2026-11-01. Run: npm run build && npm run screenshots
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'screenshots');

if (!existsSync(join(root, 'dist/index.html'))) {
  console.error('dist/ not found. Run "npm run build" first.');
  process.exit(1);
}
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const FIXED = new Date(2026, 10, 1, 18, 30, 0).getTime();
const server = await preview({ root, preview: { port: 4173, strictPort: true, host: '127.0.0.1' }, logLevel: 'error' });
const base = 'http://127.0.0.1:4173/';
const browser = await chromium.launch();

const VIEWPORTS = [
  { tag: 'desktop', width: 1440, height: 900, mobile: false },
  { tag: 'mobile', width: 390, height: 844, mobile: true },
];

let problems = 0;

async function newPage(vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.mobile ? 2 : 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    colorScheme: 'light',
  });
  // Fix "today" but let the clock keep running, so timers behave normally.
  await context.addInitScript((fixed) => {
    const Real = Date;
    const off = fixed - Real.now();
    class Fake extends Real {
      constructor(...a) {
        if (a.length === 0) super(Real.now() + off);
        else super(...a);
      }
      static now() {
        return Real.now() + off;
      }
    }
    window.Date = Fake;
  }, FIXED);
  const page = await context.newPage();
  page.on('pageerror', (e) => {
    problems++;
    console.error('PAGE ERROR:', e.message);
  });
  page.on('console', (m) => {
    if (m.type() === 'error') {
      problems++;
      console.error('CONSOLE ERROR:', m.text());
    }
  });
  return { page, context };
}

const settle = (page, ms = 350) => page.waitForTimeout(ms);
const go = async (page, route) => {
  await page.goto(`${base}#${route}`);
  await settle(page, 500);
};

/** Edits the saved state directly, then reloads. */
async function patchState(page, fn, arg) {
  await page.evaluate(
    ([src, a]) => {
      const s = JSON.parse(localStorage.getItem('pace.v2'));
      const next = new Function('s', 'a', `return (${src})(s, a)`)(s, a);
      localStorage.setItem('pace.v2', JSON.stringify(next));
    },
    [fn.toString(), arg],
  );
  await page.reload();
  await settle(page, 700);
}

async function run(vp, dark = false) {
  const suffix = dark ? `dark-${vp.tag}` : vp.tag;
  const shot = async (page, name, full = true) => {
    await settle(page);
    await page.screenshot({ path: join(out, `${name}-${suffix}.png`), fullPage: full });
    console.log('  saved', `${name}-${suffix}.png`);
  };
  console.log(`\n${suffix} ${vp.width}x${vp.height}`);
  const { page, context } = await newPage(vp);

  if (!dark) {
    await go(page, '/');
    await shot(page, '01-landing');
    await go(page, '/start');
    await shot(page, '02-onboarding-step-1', false);
    await go(page, '/');
  } else {
    await go(page, '/');
  }

  await page.getByRole('button', { name: 'Explore with a demo profile' }).click();
  await page.waitForURL('**/#/home');
  await settle(page, 700);
  if (dark) await patchState(page, (s) => ({ ...s, settings: { ...s.settings, theme: 'dark' } }));

  if (dark) {
    await shot(page, '03-home', false);
    await page.goto(`${base}#/test/sec-varc-1`);
    await settle(page, 800);
    await shot(page, '06-test-varc', false);
    await go(page, '/progress/review');
    await page.locator('.attempt-row').nth(1).click();
    await page.getByRole('tab', { name: /Questions/ }).click();
    await settle(page, 500);
    await shot(page, '11-review');
    await context.close();
    return;
  }

  await shot(page, '03-home', false);
  await go(page, '/practice/daily');
  await shot(page, '04-daily-set');
  await go(page, '/practice/tests?tab=sectional');
  await shot(page, '05-tests');

  // Test window: the paused VARC sectional, on a passage.
  await page.goto(`${base}#/test/sec-varc-1`);
  await settle(page, 800);
  await shot(page, '06-test-varc', false);
  if (vp.mobile) {
    await page.getByRole('button', { name: 'Passage' }).click();
    await shot(page, '06-test-varc-passage', false);
  }

  // Test window: a DILR set in a capped sectional.
  await page.goto(`${base}#/test/sec-dilr-2`);
  await settle(page, 600);
  await page.getByRole('button', { name: 'Start test' }).click();
  await settle(page, 700);
  await shot(page, '07-test-dilr', false);

  // Cap dialog: move the set timer to just under its cap. Leave the test first, because the
  // window saves on pagehide and would otherwise overwrite the patch.
  await go(page, '/home');
  await patchState(page, (s) => {
    const a = s.active['sec-dilr-2'];
    for (const t of Object.values(a.sets)) t.seconds = t.capSeconds - 3;
    return s;
  });
  await go(page, '/test/sec-dilr-2');
  await page.getByRole('dialog').waitFor({ timeout: 15000 });
  await shot(page, '08-cap-dialog', false);
  await page.getByRole('button', { name: 'Leave this set' }).click();
  await settle(page);

  // Result, from the seeded mock.
  await page.goto(`${base}#/test/mock-1/result`);
  await settle(page, 800);
  await shot(page, '09-result');

  // Replay: the seeded DILR sectional has caps and a stalled clue.
  await go(page, '/progress/review');
  await page.getByRole('link', { name: /DILR sectional 1/ }).click();
  await settle(page, 600);
  await shot(page, '10-replay');

  // Review question on a passage, so vocabulary words show.
  await go(page, '/progress/review');
  await page.getByRole('link', { name: /Full mock 1/ }).click();
  await settle(page, 400);
  await page.getByRole('tab', { name: /Questions/ }).click();
  await settle(page, 500);
  await page.getByRole('button', { name: /^Question 1,/ }).click();
  await shot(page, '11-review');
  await page.getByRole('tab', { name: /Community/ }).click();
  await shot(page, '11-review-community');
  await page.getByRole('tab', { name: 'Explanation' }).click();
  await page.locator('.vw-btn').first().click();
  await shot(page, '12-vocab-card', false);

  await go(page, '/learn/lessons');
  await shot(page, '13-lessons');
  await go(page, '/learn/lessons/qa-percent-fractions');
  await page.keyboard.press('Space');
  await page.waitForTimeout(2500);
  await shot(page, '14-lesson-player');
  await go(page, '/learn/notes');
  await shot(page, '15-notes');
  await go(page, '/learn/vocab');
  await page.getByRole('tab', { name: 'Practice' }).click();
  await settle(page, 400);
  const start = page.getByRole('button', { name: /Start practice/ });
  if (await start.count()) await start.first().click();
  await shot(page, '16-vocab-practice');

  await go(page, '/progress/planner');
  await page.getByPlaceholder('Try: DILR sets 7pm 45m').fill('RC tomorrow 8:30 30m');
  await shot(page, '17-planner', !vp.mobile);
  await go(page, '/progress/analytics');
  await shot(page, '18-analytics');
  await go(page, '/progress/streak');
  await shot(page, '19-streak');
  await go(page, '/community');
  await page.locator('a[href*="/community/"]').first().click();
  await settle(page, 500);
  await shot(page, '20-community-thread');
  await go(page, '/rewards');
  await shot(page, '21-rewards');
  await go(page, '/settings');
  await shot(page, '22-settings');
  await go(page, '/about');
  await shot(page, '23-about');
  await context.close();
}

try {
  for (const vp of VIEWPORTS) await run(vp);
  await run(VIEWPORTS[0], true);
  await run(VIEWPORTS[1], true);
} finally {
  await browser.close();
  await server.close();
}
console.log(problems ? `\nDone with ${problems} problem(s).` : '\nDone, no console errors.');
process.exit(problems ? 1 : 0);
