// Captures every route at 1440x900 and 390x844 into screenshots/.
// Uses a fixed "today" of 2026-10-31 so the countdown reads 29 days.
// Run: npm run build && npm run screenshots
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'screenshots');
const sets = JSON.parse(readFileSync(join(root, 'src/data/sample_sets.json'), 'utf8')).sets;

if (!existsSync(join(root, 'dist/index.html'))) {
  console.error('dist/ not found. Run "npm run build" first.');
  process.exit(1);
}
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const FIXED = new Date(2026, 9, 31, 10, 30, 0).getTime();
const server = await preview({ root, preview: { port: 4173, strictPort: true, host: '127.0.0.1' }, logLevel: 'error' });
const base = 'http://127.0.0.1:4173/';

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
});

const VIEWPORTS = [
  { tag: 'desktop', width: 1440, height: 900, mobile: false },
  { tag: 'mobile', width: 390, height: 844, mobile: true },
];

async function newPage(vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.mobile ? 2 : 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    reducedMotion: 'no-preference',
  });
  // Fix "today" at 2026-10-31 but let the clock keep running, so timers behave normally.
  await context.addInitScript((fixed) => {
    const Real = Date;
    window.__off = fixed - Real.now();
    class Fake extends Real {
      constructor(...a) {
        if (a.length === 0) super(Real.now() + window.__off);
        else super(...a);
      }
      static now() {
        return Real.now() + window.__off;
      }
    }
    window.Date = Fake;
  }, FIXED);
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
  page.on('console', (m) => m.type() === 'error' && console.error('CONSOLE ERROR:', m.text()));
  return { page, context };
}

const settle = (page, ms = 500) => page.waitForTimeout(ms);

async function run(vp) {
  const shot = async (page, name, full = true) => {
    await settle(page, 350);
    await page.screenshot({ path: join(out, `${name}-${vp.tag}.png`), fullPage: full });
    console.log('  saved', `${name}-${vp.tag}.png`);
  };
  console.log(`\n${vp.tag} ${vp.width}x${vp.height}`);

  // ---- landing: four chapters ----
  {
    const { page, context } = await newPage(vp);
    await page.goto(base + '#/');
    await settle(page, 3200);
    await shot(page, '01-landing-ch1', false);
    if (!vp.mobile) {
      for (const [i, name] of [
        [1, '02-landing-ch2'],
        [2, '03-landing-ch3'],
        [3, '04-landing-ch4'],
      ]) {
        await page.evaluate((k) => {
          const el = document.querySelector('.l-story');
          const range = el.offsetHeight - window.innerHeight;
          window.scrollTo(0, el.offsetTop + (k / 3) * range);
        }, i);
        await settle(page, 2600);
        await shot(page, name, false);
      }
    } else {
      await shot(page, '02-landing-full', true);
    }
    await context.close();
  }

  // ---- replay with the pre-recorded sample (before any attempt) ----
  {
    const { page, context } = await newPage(vp);
    await page.goto(base + '#/replay');
    await settle(page, 800);
    await shot(page, '09-replay-sample');
    await context.close();
  }

  // ---- about ----
  {
    const { page, context } = await newPage(vp);
    await page.goto(base + '#/about');
    await shot(page, '14-about');
    await context.close();
  }

  // ---- the full click path ----
  const { page, context } = await newPage(vp);
  await page.goto(base + '#/today');
  await settle(page, 600);
  await shot(page, '05-today');

  // a small window forces items to be dropped
  await page.getByRole('button', { name: '30', exact: true }).click();
  await settle(page, 400);
  await shot(page, '06-today-30min');
  await page.getByRole('button', { name: '60', exact: true }).click();

  await page.getByRole('button', { name: 'Start', exact: true }).first().click();
  await page.waitForURL(/#\/drill$/);
  await settle(page, 600);
  await shot(page, '07-drill');
  // run the clock down to the warning zone for a shot of the ember timer
  await page.evaluate(() => {
    window.__off += 190 * 1000;
  });
  await settle(page, 600);
  await shot(page, '08-drill-last-minute', false);

  await page.getByRole('button', { name: 'Submit order' }).click();
  await page.waitForURL(/drill\/result/);
  await settle(page, 500);
  await shot(page, '10-drill-result');

  await page.getByRole('link', { name: 'Try the top set' }).click();
  await page.waitForURL(/#\/attempt\//);
  await settle(page, 800);
  const setId = page.url().split('/attempt/')[1];
  const set = sets.find((s) => s.id === setId);
  // answer: first question wrong, second right, third unanswered
  const wrong = set.questions[0].options.find((o) => o !== set.questions[0].answer);
  const pick = (qi, name) =>
    page
      .locator('fieldset')
      .nth(qi)
      .locator('label.opt')
      .filter({ hasText: new RegExp('^' + name + '$') })
      .locator('input')
      .check({ force: true });
  await pick(0, wrong);
  await pick(1, set.questions[1].answer);
  await page.getByRole('button', { name: "I'm on this clue" }).nth(2).click({ force: true });
  await page.evaluate(() => {
    window.__off += 150 * 1000;
  });
  await settle(page, 700);
  await shot(page, '11-attempt');

  // jump to the cap
  await page.evaluate(() => {
    window.__off += 600 * 1000;
  });
  await page.getByRole('alertdialog').waitFor();
  await settle(page, 500);
  await shot(page, '12-attempt-cap-dialog', false);

  await page.getByRole('button', { name: 'Leave this set' }).click();
  await page.waitForURL(/#\/replay/);
  await settle(page, 900);
  await shot(page, '13-replay-real');

  await page.getByRole('button', { name: "Add to today's plan" }).click();
  await settle(page, 300);
  await shot(page, '15-replay-added');
  await page.getByRole('link', { name: "See today's plan" }).click();
  await page.waitForURL(/#\/today/);
  await settle(page, 600);
  await shot(page, '16-today-redo-added');
  await context.close();
}

try {
  for (const vp of VIEWPORTS) await run(vp);
} finally {
  await browser.close();
  await server.close();
}
console.log('\nDone. Screenshots in', out);
