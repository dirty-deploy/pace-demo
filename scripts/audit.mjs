// Pre-finale audit: every route at 1440x900 and 390x844, fresh and demo profiles, plus the main flows.
// Run against a production build:  npm run build && npx vite preview --port 4173
//   node scripts/audit.mjs                 (all)
//   node scripts/audit.mjs routes|flows    (one part)
// Optional: KEYS=<path to json of {id, kind, idx, ans}> for sec-qa-1 enables the scoring flow.
// The browser clock is pinned to 2026-11-04 09:00 local time with Playwright's clock (the app is unchanged).
// Output: problems as text on stdout, full results in audit-output/audit.json, screenshots of flagged routes in audit-output/.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:4173/';
const OUT = 'audit-output';
const PART = process.argv[2] ?? 'all';
const FIXED = new Date(2026, 10, 4, 9, 0, 0);
const CREDIT = /Pace is a concept redesign by Team Apex/;
const FORBIDDEN = /\bTODO\b|lorem|\bundefined\b|\bNaN\b|\[object Object\]|coming soon|\bnull\b/i;
const VIEWPORTS = [
  { tag: '1440', width: 1440, height: 900, mobile: false },
  { tag: '390', width: 390, height: 844, mobile: true },
];
const STATIC_ROUTES = [
  '/', '/start', '/about', '/home', '/practice/daily', '/practice/tests', '/practice/tests?tab=sectional', '/practice/tests?tab=topic',
  '/practice/drill', '/learn/lessons', '/learn/notes', '/learn/vocab', '/progress/review', '/progress/analytics', '/progress/planner',
  '/progress/streak', '/community', '/rewards', '/settings', '/more',
  '/test/mock-1', '/test/mock-2', '/test/sec-varc-1', '/test/sec-dilr-1', '/test/sec-qa-1', '/test/mock-1/result',
];
/** Router patterns from src/App.tsx. */
const PATTERNS = [
  /^\/$/, /^\/start$/, /^\/about$/, /^\/test\/[^/]+$/, /^\/test\/[^/]+\/result$/, /^\/redo\/[^/]+$/, /^\/home$/, /^\/practice\/(daily|tests|drill)$/,
  /^\/learn\/(lessons|notes|vocab)$/, /^\/learn\/lessons\/[^/]+$/, /^\/progress\/(review|analytics|planner|streak)$/, /^\/progress\/review\/[^/]+$/,
  /^\/community$/, /^\/community\/[^/]+$/, /^\/rewards$/, /^\/settings$/, /^\/more$/,
];
const SAMPLE_ROUTES = [/^\/learn\/notes/, /^\/community/];
const routeKnown = (r) => PATTERNS.some((p) => p.test(r.split('?')[0]));
const family = (r) => r.split('?')[0].split('/').slice(0, 3).join('/') + (r.split('/').length > 3 ? '/:id' : '');

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const results = { date: 'Playwright clock 2026-11-04 09:00', routes: [], flows: [] };

async function newPage(vp) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile, acceptDownloads: true });
  await context.clock.install({ time: FIXED });
  const page = await context.newPage();
  const log = [];
  page.on('pageerror', (e) => log.push(`pageerror: ${e.message.slice(0, 160)}`));
  page.on('console', (m) => m.type() === 'error' && log.push(`console.error: ${m.text().slice(0, 160)}`));
  page.on('requestfailed', (r) => log.push(`requestfailed: ${r.url().replace(BASE, '/')}`));
  page.on('response', (r) => r.status() >= 400 && log.push(`HTTP ${r.status()}: ${r.url().replace(BASE, '/')}`));
  return { page, context, log };
}
const settle = (page, ms = 450) => page.waitForTimeout(ms);
const hash = (page) => decodeURIComponent(new URL(page.url()).hash.slice(1) || '/');
async function demo(page) {
  await page.goto(`${BASE}#/`);
  await page.getByRole('button', { name: 'Explore with a demo profile' }).click();
  await page.waitForURL('**/#/home');
  await settle(page);
}
async function patch(page, src) {
  await page.evaluate((s) => {
    const st = JSON.parse(localStorage.getItem('pace.v2'));
    new Function('s', s)(st);
    localStorage.setItem('pace.v2', JSON.stringify(st));
  }, src);
  await page.reload();
  await settle(page, 600);
}

/** Layout and content checks run inside the page. */
function inspect() {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  const vis = (el) => {
    const s = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    return s.visibility !== 'hidden' && s.display !== 'none' && b.width > 0 && b.height > 0;
  };
  const name = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].slice(0, 2).map((c) => '.' + c).join('')}`;
  const wide = [];
  if (sw > vw) {
    for (const el of document.querySelectorAll('body *')) {
      const b = el.getBoundingClientRect();
      if (b.right > vw + 1 && b.width > 0 && !(el.parentElement && el.parentElement.getBoundingClientRect().right > vw + 1)) wide.push(`${name(el)} right=${Math.round(b.right)}`);
      if (wide.length > 4) break;
    }
  }
  const cut = [];
  for (const el of document.querySelectorAll('button, .btn, .tag, .chip, h1, h2, h3, label, .stat')) {
    if (!vis(el) || el.clientWidth <= 1 || el.classList.contains('sr-only')) continue;
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'visible' && getComputedStyle(el).textOverflow !== 'ellipsis') cut.push(name(el) + ` "${el.textContent.trim().slice(0, 30)}"`);
    if (cut.length > 4) break;
  }
  const empty = [...document.querySelectorAll('.card')].filter((c) => vis(c) && (c.getBoundingClientRect().height < 12 || !c.textContent.trim())).map(name).slice(0, 4);
  const cards = [...document.querySelectorAll('.card')].filter(vis);
  const overlap = [];
  for (let i = 0; i < cards.length && overlap.length < 3; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i].contains(cards[j]) || cards[j].contains(cards[i])) continue;
      const a = cards[i].getBoundingClientRect();
      const b = cards[j].getBoundingClientRect();
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 6 && oy > 6 && getComputedStyle(cards[i]).position !== 'fixed' && getComputedStyle(cards[j]).position !== 'fixed') overlap.push(`${name(cards[i])} x ${name(cards[j])}`);
    }
  }
  const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  const deadHash = [...document.querySelectorAll('a[href="#"], a[href=""]')].length;
  const text = document.body.innerText;
  const sheetCredit = !!document.querySelector('.tw-sheet .credit, .tw-side .credit') || (/Pace is a concept redesign/.test(document.body.textContent) && !!document.querySelector('.tw'));
  return { vw, sw, wide, cut, empty, overlap, links, deadHash, text, sheetCredit };
}

async function checkRoute(page, log, route, profile, vp) {
  log.length = 0;
  await page.goto(`${BASE}#${route}`);
  await settle(page, 700);
  const r = await page.evaluate(inspect);
  const landed = hash(page);
  const credit = CREDIT.test(r.text) || r.sheetCredit;
  const forbidden = (r.text.match(new RegExp(FORBIDDEN.source, 'gi')) ?? []).slice(0, 3);
  const sampleNeeded = SAMPLE_ROUTES.some((p) => p.test(route));
  const row = {
    route, profile, vp: vp.tag, landed, renders: r.text.trim().length > 80, errors: [...new Set(log)],
    overflow: r.sw > r.vw ? `${r.sw}px: ${r.wide.join(', ')}` : '', credit, forbidden,
    sampleOk: !sampleNeeded || landed !== route.split('?')[0] || /Sample data/.test(r.text),
    creditNote: !CREDIT.test(r.text) && r.sheetCredit ? 'credit only in the palette (sheet on mobile)' : '', cut: r.cut, empty: r.empty, overlap: r.overlap,
    deadHash: r.deadHash, badLinks: [...new Set(r.links.filter((h) => h.startsWith('#/') && !routeKnown(h.slice(1))))],
  };
  row.flag = !row.renders || row.errors.length || row.overflow || !credit || forbidden.length || !row.sampleOk || row.cut.length || row.empty.length || row.overlap.length || row.deadHash || row.badLinks.length;
  if (row.flag && process.env.SHOTS) await page.screenshot({ path: join(OUT, `${profile}-${vp.tag}-${route.replace(/[/?=]/g, '_')}.png`) });
  results.routes.push(row);
  return r.links;
}

async function auditRoutes() {
  for (const profile of ['fresh', 'demo']) {
    for (const vp of VIEWPORTS) {
      const { page, context, log } = await newPage(vp);
      if (profile === 'demo') await demo(page);
      const seen = new Set();
      const families = new Map();
      const queue = [...STATIC_ROUTES];
      while (queue.length) {
        const route = queue.shift();
        if (seen.has(route)) continue;
        seen.add(route);
        const links = await checkRoute(page, log, route, profile, vp);
        for (const h of links) {
          if (!h.startsWith('#/')) continue;
          const next = h.slice(1);
          const fam = family(next);
          if (seen.has(next) || queue.includes(next) || (families.get(fam) ?? 0) >= 3 || !routeKnown(next)) continue;
          families.set(fam, (families.get(fam) ?? 0) + 1);
          queue.push(next);
        }
      }
      await context.close();
    }
  }
}

// ---------------- Flows ----------------
let flow = null;
function startFlow(name) {
  flow = { name, steps: [], result: 'Works' };
  results.flows.push(flow);
}
async function step(label, fn) {
  if (flow.stopped) return;
  try {
    const note = await fn();
    flow.steps.push({ label, ok: true, note: note ?? '' });
  } catch (e) {
    flow.steps.push({ label, ok: false, note: String(e.message ?? e).split('\n')[0].slice(0, 200) });
    flow.result = flow.steps.some((s) => s.ok) ? 'Partly works' : 'Broken';
    flow.stopped = true;
  }
}
const must = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const visible = async (loc, msg, timeout = 5000) => {
  await loc.first().waitFor({ state: 'visible', timeout }).catch(() => {
    throw new Error(msg);
  });
};
async function answerVisible(page, idx = 0) {
  const radio = page.getByRole('radio');
  if (await radio.count()) await radio.nth(idx).check();
  else await page.getByLabel('Your answer').fill('1234');
}
async function timerText(page) {
  return (await page.getByRole('timer').first().textContent())?.trim();
}
async function openSheet(page) {
  const open = page.getByRole('button', { name: 'Open question palette' });
  if ((await open.count()) && (await open.isVisible())) await open.click();
}
async function submitTest(page) {
  if (!(await page.getByRole('button', { name: 'Submit test' }).first().isVisible())) await openSheet(page);
  await page.getByRole('button', { name: 'Submit test' }).locator('visible=true').first().click();
  await page.getByRole('dialog', { name: /Submit this test/ }).getByRole('button', { name: 'Submit', exact: true }).click();
  await visible(page.getByRole('heading', { name: 'Your result' }), 'no result page after submit');
}

async function flowOnboarding(vp) {
  startFlow(`1. Onboarding (fresh) ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  await step('landing → Start preparing', async () => {
    await page.goto(`${BASE}#/`);
    await page.getByRole('link', { name: 'Start preparing' }).first().click();
    await page.waitForURL('**/#/start');
  });
  await step('name, Continue, Back keeps the name', async () => {
    await page.getByLabel('Your name').fill('Riya');
    await page.getByRole('button', { name: 'Continue' }).click();
    await settle(page);
    await page.getByRole('button', { name: 'Back' }).click();
    await settle(page);
    must((await page.getByLabel('Your name').inputValue()) === 'Riya', 'Back lost the name');
  });
  await step('all steps → Finish → Home', async () => {
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: '45 min' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.waitForURL('**/#/home');
    await visible(page.getByRole('heading', { name: "Today's plan" }), "no Today's plan");
  });
  await context.close();
  const b = await newPage(vp);
  await step('Skip works', async () => {
    await b.page.goto(`${BASE}#/start`);
    const seen = [];
    for (let i = 0; i < 6 && hash(b.page) === '/start'; i++) {
      seen.push(((await b.page.getByRole('heading', { level: 1 }).first().textContent()) ?? '').slice(0, 24));
      await b.page.getByRole('button', { name: 'Skip' }).first().click();
      await settle(b.page, 400);
    }
    must(hash(b.page) !== '/start', `Skip never left onboarding: ${seen.join(' / ')}`);
    return `Skip moves one step at a time (${seen.length} steps), then lands on ${hash(b.page)}`;
  });
  await b.context.close();
  flow.errors = [...new Set([...log, ...b.log])];
}

async function flowDemoPath(vp) {
  startFlow(`2. Demo path ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  let attemptId = null;
  await step('1 landing → Explore with a demo profile', () => demo(page));
  await step('2 Home shows today\'s plan', async () => {
    await visible(page.getByRole('heading', { name: "Today's plan" }), "no Today's plan");
  });
  await step('3 drill: timer counts down, lock in, see result', async () => {
    await page.goto(`${BASE}#/practice/drill`);
    await settle(page, 600);
    const t1 = await timerText(page);
    await page.waitForTimeout(2200);
    const t2 = await timerText(page);
    must(t1 && t2 && t1 !== t2, `drill timer did not move (${t1} → ${t2})`);
    await page.getByRole('button', { name: 'Lock in my order' }).click();
    await visible(page.getByText(/recommended order/), 'no drill result');
    return `timer ${t1} → ${t2}`;
  });
  let cap = 0;
  await step('4 capped DILR set opens with a set cap', async () => {
    await page.getByRole('button', { name: 'Try the recommended first set' }).click();
    await visible(page.getByText(/Set time/), 'no set timer');
    const t = await page.getByText(/Set time/).first().textContent();
    const m = /of (\d+):(\d+) cap/.exec(t);
    must(m, `cap text unreadable: ${t}`);
    cap = Number(m[1]) * 60 + Number(m[2]);
    await answerVisible(page);
    return `cap ${m[1]}:${m[2]}, url ${hash(page)}`;
  });
  await step('4 cap dialog appears at the cap', async () => {
    for (let s = 0; s < cap + 5; s += 20) await page.clock.runFor(20_000);
    await settle(page);
    await visible(page.getByRole('dialog').getByText('Time to decide'), 'no cap dialog after cap time');
  });
  await step('4 Take 2 more minutes works once only', async () => {
    await page.getByRole('button', { name: /Take 2 more minutes/ }).click();
    await settle(page);
    must(!(await page.getByRole('dialog').count()), 'dialog stayed open after extending');
    for (let s = 0; s < 125; s += 20) await page.clock.runFor(20_000);
    await settle(page);
    await visible(page.getByRole('dialog').getByText('Your extra time is used'), 'no second cap dialog');
    must(!(await page.getByRole('button', { name: /Take 2 more minutes/ }).count()), 'extension offered twice');
  });
  await step('4 Leave this set', async () => {
    await page.getByRole('button', { name: 'Leave this set' }).click();
    await settle(page, 600);
    must(/^\/progress\/review\/[^/]+\?tab=replay/.test(hash(page)), `Leave did not open the replay: ${hash(page)}`);
    return `after leave: ${hash(page)}`;
  });
  await step('5 replay for this attempt', async () => {
    if (!/^\/progress\/review\//.test(hash(page))) {
      if (/^\/test\//.test(hash(page)) && !/result/.test(hash(page))) await submitTest(page);
      await page.getByRole('link', { name: /replay/i }).first().click();
    }
    await settle(page, 700);
    await visible(page.getByRole('tab', { name: 'Replay', selected: true }), 'Replay tab not selected');
    const h = hash(page);
    must(/^\/progress\/review\/[^/]+/.test(h), `not on a review page: ${h}`);
    attemptId = h.split('/')[3].split('?')[0];
    must(!attemptId.startsWith('demo-'), `replay shows a seeded attempt ${attemptId}`);
    const text = await page.locator('main').innerText();
    must(/\d+:\d\d|min/.test(text), 'replay has no timings');
    return `replay of ${attemptId}`;
  });
  await step('6 review: shares, explanation, community, vocabulary', async () => {
    await page.goto(`${BASE}#/progress/review`);
    await page.getByRole('link', { name: /Full mock 1/ }).first().click();
    await page.getByRole('tab', { name: /Questions/ }).click();
    await page.getByRole('button', { name: /^Question 1,/ }).click();
    await settle(page);
    const pcts = (await page.locator('.rv-pct').allTextContents()).map((t) => parseInt(t, 10));
    const sum = pcts.reduce((a, b) => a + b, 0);
    must(pcts.length && Math.abs(sum - 100) <= 2, `shares sum to ${sum}`);
    must(await page.locator('li.correct').count(), 'no correct option marked');
    await visible(page.getByText('Sample data'), 'no Sample data tag on shares');
    await page.getByRole('tab', { name: 'Explanation' }).click();
    const lines = await page.locator('.rv-lines li').allTextContents();
    must(lines.length, 'no explanation lines');
    await page.getByRole('tab', { name: /Community/ }).click();
    await visible(page.getByText(/^Sample (student|alum)/), 'no sample community answers');
    await page.getByLabel('Add your answer').fill('Audit check: I re-read the second paragraph.');
    await page.getByRole('button', { name: 'Post answer' }).click();
    await visible(page.getByText('Audit check: I re-read'), 'posted answer not shown');
    await page.getByRole('tab', { name: 'Explanation' }).click();
    const word = page.locator('.vw-btn').first();
    must(await word.count(), 'no vocabulary word in this question');
    const w = (await word.textContent()).trim();
    await word.click();
    await visible(page.getByRole('dialog').getByText('With the simpler word'), 'word card did not open');
    await page.getByRole('button', { name: 'Add to my words' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click();
    await page.goto(`${BASE}#/learn/vocab`);
    await settle(page, 600);
    must(new RegExp(w, 'i').test(await page.locator('main').innerText()), `word "${w}" not in Vocabulary`);
    return `${pcts.length} options, sum ${sum}, ${lines.length} explanation lines, word "${w}"`;
  });
  await step('7 planner quick add "DILR sets 7pm 45m"', async () => {
    await page.goto(`${BASE}#/progress/planner`);
    await settle(page, 600);
    const q = page.getByPlaceholder('Try: DILR sets 7pm 45m');
    await q.fill('DILR sets 7pm 45m');
    const chip = (await page.locator('.pl-chip').first().textContent())?.trim();
    must(chip, 'no preview chip');
    await q.press('Enter');
    await settle(page);
    const labels = await page.locator('[aria-label*="DILR sets"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    must(labels.length, 'no DILR sets block in the grid');
    return `chip "${chip}"; block "${labels[labels.length - 1]}"`;
  });
  flow.errors = [...new Set(log)];
  flow.attemptId = attemptId;
  await context.close();
}

async function flowDailySet(vp) {
  startFlow(`3. Daily set ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  await demo(page);
  await step('build a custom set (topic, count, time, difficulty)', async () => {
    await page.goto(`${BASE}#/practice/daily`);
    await settle(page, 600);
    await page.getByRole('button', { name: 'Reading comprehension' }).click();
    await page.getByRole('button', { name: '5', exact: true }).click();
    const times = page.getByRole('button', { name: /^\d+ min$/ });
    if (await times.count()) await times.first().click();
    const lvl = page.getByRole('button', { name: 'Match my level' });
    if (await lvl.count()) await lvl.click();
    await visible(page.getByText(/5 questions · \d+ min/), 'summary does not show 5 questions');
    return (await page.getByText(/5 questions · \d+ min/).first().textContent()).trim();
  });
  await step('save as a preset', async () => {
    await page.getByRole('button', { name: 'Save as my daily set' }).click();
    await page.getByPlaceholder('Morning QA').fill('Audit RC');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await settle(page);
    await visible(page.getByText('Audit RC'), 'preset not listed');
  });
  await step('start, answer 2, submit, result, review', async () => {
    await page.getByRole('button', { name: 'Start set' }).click();
    await visible(page.getByRole('timer'), 'no test timer');
    await answerVisible(page);
    await page.getByRole('button', { name: 'Save & next' }).click();
    await answerVisible(page);
    await submitTest(page);
    await page.getByRole('link', { name: 'Review answers' }).click();
    await settle(page, 600);
    must(/^\/progress\/review\//.test(hash(page)), 'Review answers did not open review');
  });
  flow.errors = [...new Set(log)];
  await context.close();
}

async function flowMock(vp) {
  startFlow(`4. Full mock ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  await demo(page);
  await step('start mock, VARC first, timer counts', async () => {
    await page.goto(`${BASE}#/test/mock-2`);
    await page.getByRole('button', { name: 'Start test' }).click();
    await visible(page.getByText(/Section 1 of 3/), 'no section 1 label');
    const t1 = await timerText(page);
    await page.waitForTimeout(2200);
    const t2 = await timerText(page);
    must(t1 !== t2, 'timer did not move');
    return `timer ${t1} → ${t2}`;
  });
  await step('section lock: no early DILR', async () => {
    must(await page.getByRole('button', { name: 'Next section' }).first().isDisabled(), 'Next section is enabled');
    must(!(await page.getByRole('button', { name: 'Submit test' }).count()), 'Submit offered in section 1');
    must(!(await page.getByText(/DILR questions/).count()), 'DILR palette visible early');
  });
  await step('palette states: answered, marked, not answered', async () => {
    await answerVisible(page);
    await page.getByRole('button', { name: 'Mark for review & next' }).first().click();
    await page.getByRole('button', { name: 'Save & next' }).first().click();
    await settle(page);
    if (vp.mobile) {
      const open = page.getByRole('button', { name: /Questions|Palette/ }).first();
      if (await open.count()) await open.click();
    }
    await visible(page.getByRole('button', { name: /Question 1, Answered and marked/ }), 'Q1 not "Answered and marked"');
    await visible(page.getByRole('button', { name: /Question 2, Not answered/ }), 'Q2 not "Not answered"');
    const c1 = await page.getByRole('button', { name: /Question 1,/ }).first().evaluate((e) => getComputedStyle(e).backgroundColor);
    const c2 = await page.getByRole('button', { name: /Question 2,/ }).first().evaluate((e) => getComputedStyle(e).backgroundColor);
    const c5 = await page.getByRole('button', { name: /Question 5,/ }).first().evaluate((e) => getComputedStyle(e).backgroundColor);
    must(new Set([c1, c2, c5]).size === 3, `palette colours not distinct: ${c1} ${c2} ${c5}`);
    if (vp.mobile) await page.keyboard.press('Escape');
  });
  await step('jump to QA (patched clock), calculator opens', async () => {
    await page.goto(`${BASE}#/home`);
    await patch(page, "s.active['mock-2'].secondsLeft[0] = 2; s.active['mock-2'].secondsLeft[1] = 2;");
    await page.goto(`${BASE}#/test/mock-2`);
    await settle(page, 600);
    for (let i = 0; i < 4; i++) await page.clock.runFor(3000);
    await visible(page.getByText(/Section 3 of 3/), 'did not reach QA', 12000);
    await page.getByRole('button', { name: 'Calculator' }).click();
    const calc = page.getByRole('region', { name: 'Calculator' });
    for (const k of ['1', '2', '×', '3', '=']) await calc.getByRole('button', { name: k, exact: true }).click();
    must((await calc.locator('output').textContent()).trim() === '36', 'calculator wrong');
  });
  await step('submit → result → replay → review', async () => {
    await submitTest(page);
    const pct = await page.getByText(/percentile/).first().textContent();
    await page.getByRole('link', { name: 'Review answers' }).click();
    await settle(page, 600);
    must(/^\/progress\/review\//.test(hash(page)), 'no review');
    await page.getByRole('tab', { name: 'Replay' }).click();
    await page.getByRole('tab', { name: /Questions/ }).click();
    return pct.trim().slice(0, 60);
  });
  flow.errors = [...new Set(log)];
  await context.close();
}

async function flowScoring(vp) {
  startFlow(`5. Scoring ${vp.tag}`);
  if (!process.env.KEYS || !existsSync(process.env.KEYS)) {
    flow.result = 'Not tested';
    flow.steps.push({ label: 'needs KEYS', ok: false, note: 'KEYS file not given' });
    return;
  }
  const keys = JSON.parse(readFileSync(process.env.KEYS, 'utf8'));
  const { page, context, log } = await newPage(vp);
  await demo(page);
  // Plan: right, wrong, wrong, right, skip, right, wrong, wrong.
  const plan = ['right', 'wrong', 'wrong', 'right', 'skip', 'right', 'wrong', 'wrong'];
  let expected = 0;
  await step('answer 8 questions of QA sectional 1 to a plan', async () => {
    await page.goto(`${BASE}#/test/sec-qa-1`);
    await page.getByRole('button', { name: 'Start test' }).click();
    for (let i = 0; i < plan.length; i++) {
      const k = keys[i];
      const p = plan[i];
      if (p !== 'skip') {
        if (k.kind === 'mcq') await page.getByRole('radio').nth(p === 'right' ? k.idx : (k.idx + 1) % k.n).check();
        else await page.getByLabel('Your answer').fill(p === 'right' ? String(k.ans) : String(Number(k.ans) + 7));
        expected += p === 'right' ? 3 : k.kind === 'mcq' ? -1 : 0;
      }
      await page.getByRole('button', { name: 'Save & next' }).first().click();
    }
    return `expected ${expected}`;
  });
  await step('score follows +3 / −1 MCQ / 0 TITA', async () => {
    await submitTest(page);
    const t = await page.locator('body').innerText();
    const m = /(-?\d+) \/ (\d+)/.exec(t);
    must(m && Number(m[1]) === expected, `shown ${m?.[0]}, expected ${expected}`);
    return `shown ${m[0]}`;
  });
  flow.errors = [...new Set(log)];
  await context.close();
}

async function flowResume(vp) {
  startFlow(`6. Autosave and resume ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  await demo(page);
  await step('answer, reload, answers kept', async () => {
    await page.goto(`${BASE}#/test/sec-varc-2`);
    await page.getByRole('button', { name: 'Start test' }).click();
    await page.getByRole('radio').nth(1).check();
    await page.getByRole('button', { name: 'Save & next' }).first().click();
    await page.reload();
    await settle(page, 700);
    const resume = page.getByRole('button', { name: /Resume/ });
    if (await resume.count()) await resume.first().click();
    await visible(page.getByRole('heading', { name: /Question 2 of 24/ }), 'did not return to question 2');
  });
  await step('Home shows a Resume entry', async () => {
    await page.goto(`${BASE}#/home`);
    await settle(page, 600);
    await visible(page.getByText(/VARC sectional 2 · 1 answered/), 'no resume entry on Home');
    const link = page.getByRole('link', { name: /Resume/ });
    return (await link.count()) ? 'Resume link shown' : 'entry shown, no "Resume" wording';
  });
  flow.errors = [...new Set(log)];
  await context.close();
}

async function flowKnown(vp) {
  startFlow(`Known issues 3 and 6 ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  await demo(page);
  for (const id of ['sec-dilr-1', 'sec-dilr-2', 'sec-dilr-3']) {
    await step(`${id}: "Question 1 of 22", credit in palette only`, async () => {
      await page.goto(`${BASE}#/test/${id}`);
      await page.getByRole('button', { name: 'Start test' }).click();
      await visible(page.getByRole('heading', { name: 'Question 1 of 22' }), 'not "Question 1 of 22"');
      must(!(await page.locator('.tw-qcol .credit').count()), 'credit still in the question column');
      must(await page.locator('.tw-side .credit, .tw-sheet .credit').count(), 'credit missing from the palette');
      if (!vp.mobile) must(await page.locator('.tw-side .credit').isVisible(), 'palette credit not visible');
      await page.getByRole('button', { name: 'Save and exit' }).locator('visible=true').first().click().catch(() => {});
    });
  }
  flow.errors = [...new Set(log)];
  await context.close();
}

async function flowLessons(vp) {
  startFlow(`8. Lessons ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  await demo(page);
  await step('open lesson, play, pause', async () => {
    await page.goto(`${BASE}#/learn/lessons`);
    await settle(page, 600);
    await page.locator('a[href^="#/learn/lessons/"]').first().click();
    await settle(page, 600);
    const pos = page.getByRole('slider', { name: 'Lesson position' });
    const v0 = Number(await pos.getAttribute('aria-valuenow'));
    await page.getByRole('button', { name: /^Play/ }).first().click();
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: /^Pause/ }).first().click();
    const v1 = Number(await pos.getAttribute('aria-valuenow'));
    must(v1 > v0, `position did not advance (${v0} → ${v1})`);
    await page.waitForTimeout(1200);
    must(Number(await pos.getAttribute('aria-valuenow')) === v1, 'kept playing after pause');
    return `${v0} → ${v1}`;
  });
  await step('scrub, speed, transcript jump', async () => {
    const pos = page.getByRole('slider', { name: 'Lesson position' });
    await pos.focus();
    await page.keyboard.press('End');
    const end = Number(await pos.getAttribute('aria-valuenow'));
    await page.keyboard.press('Home');
    must(Number(await pos.getAttribute('aria-valuenow')) === 0 && end > 0, 'scrub keys failed');
    const speed = page.getByLabel('Playback speed');
    if ((await speed.evaluate((e) => e.tagName)) === 'SELECT') await speed.selectOption({ index: 2 });
    else await speed.click();
    const lines = page.locator('.lp-line');
    const n = await lines.count();
    must(n > 2, 'no transcript lines');
    await lines.nth(Math.min(4, n - 1)).click();
    await settle(page);
    must(Number(await pos.getAttribute('aria-valuenow')) > 0, 'transcript click did not jump');
  });
  await step('answer a practice question', async () => {
    const opts = page.locator('.lp-option');
    const n = await opts.count();
    if (n) await opts.first().click();
    else {
      await page.locator('.lp-practice input, input.num').last().fill('10');
      await page.getByRole('button', { name: 'Check' }).first().click();
    }
    await settle(page);
    const states = await page.locator('.lp-option').evaluateAll((els) => els.map((e) => e.dataset.state).join(','));
    must(!n || /correct|wrong|right/i.test(states) || (await page.getByText(/The answer is/).count()), `no feedback (${states})`);
    return n ? `MCQ option states: ${states}` : 'TITA checked';
  });
  flow.errors = [...new Set(log)];
  await context.close();
}

async function flowPlanner(vp) {
  startFlow(`9. Planner ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  await demo(page);
  await page.goto(`${BASE}#/progress/planner`);
  await settle(page, 600);
  const q = page.getByPlaceholder('Try: DILR sets 7pm 45m');
  const blocks = (t) => page.locator(`[aria-label*="${t}"]`).evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
  await step('quick add "DILR sets 7pm 45m"', async () => {
    await q.fill('DILR sets 7pm 45m');
    const chip = (await page.locator('.pl-chip').first().textContent()).trim();
    must(/7(:00)?\s?pm|19:00/i.test(chip) && /45/.test(chip) && /Wed|4 Nov|Today/i.test(chip), `chip "${chip}"`);
    await q.press('Enter');
    await settle(page);
    const b = await blocks('DILR sets');
    must(b.some((l) => /7(:00)?\s?pm|19:00/i.test(l)), `blocks: ${b.join(' | ')}`);
    return `chip "${chip}"`;
  });
  await step('quick add "RC tomorrow 8:30 30m"', async () => {
    await q.fill('RC tomorrow 8:30 30m');
    const chip = (await page.locator('.pl-chip').first().textContent()).trim();
    must(/Thu|5 Nov|Tomorrow/i.test(chip) && /8:30/.test(chip) && /30/.test(chip), `chip "${chip}"`);
    await q.press('Enter');
    await settle(page);
    const b = await blocks('RC');
    must(b.some((l) => /8:30/.test(l) && /Thu|5 Nov/i.test(l)), `blocks: ${b.join(' | ')}`);
    return `chip "${chip}"`;
  });
  await step('click an empty slot to add', async () => {
    const grid = page.getByLabel(/Week grid/);
    const box = await grid.boundingBox();
    await grid.click({ position: { x: box.width * 0.93, y: 30 } });
    await settle(page);
    const input = page.locator('.pl-draft input, .pl-draft textarea').first();
    await visible(input, 'no title box after slot click');
    await input.fill('Audit slot');
    await input.press('Enter');
    await settle(page);
    must((await blocks('Audit slot')).length, 'slot block not added');
  });
  await step('template chip adds a block', async () => {
    const before = await page.locator('.pl-block, [class*="pl-block"]').count();
    await page.locator('.pl-template').first().click();
    await settle(page);
    const add = page.getByRole('button', { name: 'Add block' });
    if (await add.count()) await add.first().click();
    await settle(page);
    const after = await page.locator('.pl-block, [class*="pl-block"]').count();
    must(after > before, `blocks ${before} → ${after}`);
  });
  await step('Fill my week', async () => {
    const before = await page.locator('.pl-block, [class*="pl-block"]').count();
    await page.getByRole('button', { name: 'Fill my week' }).click();
    await settle(page);
    const after = await page.locator('.pl-block, [class*="pl-block"]').count();
    return `blocks ${before} → ${after}`;
  });
  await step('tick a block done, move a missed block to tomorrow', async () => {
    const block = page.locator('.pl-grid [role="button"][aria-label*=" min"]:not([aria-label$="done"])').first();
    const label = await block.getAttribute('aria-label', { timeout: 5000 });
    await block.click();
    await page.getByRole('dialog').getByRole('button', { name: 'Mark done' }).click();
    await settle(page);
    const closer = page.getByRole('dialog').getByRole('button', { name: 'Close' });
    if (await closer.count()) await closer.first().click();
    const title = label.split(', ')[1];
    must((await blocks(`${label}, done`)).length, `"${title}" not marked done`);
    // The demo has no missed block at 09:00 on Wednesday, so add one for yesterday.
    await patch(page, "s.planner.push({ id: 'audit-missed', dateISO: '2026-11-03', startMin: 480, minutes: 30, subject: 'QA', title: 'Audit missed', done: false });");
    const move = page.getByRole('button', { name: /^Move .+ to tomorrow$/ });
    const n0 = await move.count();
    must(n0, 'no "Move to tomorrow" for missed blocks');
    await move.first().click();
    await settle(page);
    return `marked "${title}" done; missed blocks ${n0} → ${await move.count()}`;
  });
  flow.errors = [...new Set(log)];
  await context.close();
}

async function flowStreak(vp) {
  startFlow(`10. Streak counts today ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  await demo(page);
  await step('before: today not yet done', async () => {
    await page.goto(`${BASE}#/progress/streak`);
    await settle(page, 600);
    return (await page.locator('main').innerText()).match(/November 2026[^\n]*\n?[^\n]*studied/)?.[0]?.replace(/\n/g, ' ');
  });
  await step('answer one question in a set', async () => {
    await page.goto(`${BASE}#/test/sec-varc-3`);
    await page.getByRole('button', { name: 'Start test' }).click();
    await page.getByRole('radio').first().check();
    await page.waitForTimeout(1500);
    await submitTest(page);
  });
  await step('after: today Done and month total includes today', async () => {
    await page.goto(`${BASE}#/progress/streak`);
    await settle(page, 600);
    const t = await page.locator('main').innerText();
    must(/Done/.test(t), 'today not Done');
    const m = /([\d h]+min) studied/.exec(t);
    must(m && !/^0 min/.test(m[1]), `month total "${m?.[0]}"`);
    return m[0];
  });
  flow.errors = [...new Set(log)];
  await context.close();
}

async function flowRewards(vp) {
  startFlow(`11. Rewards ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  await demo(page);
  await page.goto(`${BASE}#/rewards`);
  await settle(page, 600);
  const balance = async () => Number(/[\d,]+/.exec((await page.getByLabel('Your coins').first().textContent()) ?? '')?.[0].replace(/,/g, '') ?? NaN);
  await step('buy a streak shield; balance and history update', async () => {
    const b0 = await balance();
    await page.getByRole('button', { name: 'Buy for 40 coins' }).click();
    await settle(page);
    const b1 = await balance();
    must(b1 === b0 - 40, `balance ${b0} → ${b1}`);
    return `balance ${b0} → ${b1}`;
  });
  await step('discount: 100 coins = ₹50, capped at 30%', async () => {
    const coins = page.getByLabel('Coins to use');
    await coins.fill('100');
    const r1 = (await page.locator('.rw-result').textContent()).trim();
    must(/₹\s?50\b/.test(r1), `100 coins → "${r1}"`);
    await coins.fill('100000');
    const r2 = (await page.locator('.rw-result').textContent()).trim();
    const course = await page.getByLabel('Course').evaluate((s) => s.options[s.selectedIndex].text);
    const price = Number(course.split('₹').pop().replace(/[^\d]/g, ''));
    const off = Number((/₹\s?([\d,]+)/.exec(r2)?.[1] ?? '0').replace(/,/g, ''));
    must(off <= Math.round(price * 0.3) + 1, `discount ₹${off} over 30% of ₹${price}`);
    return `100 → "${r1.slice(0, 60)}"; max → ₹${off} of ₹${price}`;
  });
  await step('demo coupon', async () => {
    await page.getByLabel('Coins to use').fill('100');
    const b0 = await balance();
    await page.getByRole('button', { name: 'Get a demo coupon' }).click();
    await visible(page.getByText(/MER-[A-Z2-9]{4}-[A-Z2-9]{4}/), 'no coupon');
    return `balance ${b0} → ${await balance()}`;
  });
  flow.errors = [...new Set(log)];
  await context.close();
}

async function flowAnalytics(vp) {
  startFlow(`12. Analytics thin data ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  await demo(page);
  await step('topics under 5 attempts say "Not enough data yet"', async () => {
    await page.goto(`${BASE}#/progress/analytics`);
    await settle(page, 700);
    await page.getByRole('tab', { name: 'Accuracy by topic' }).click();
    await settle(page);
    const rows = await page.locator('table tr').evaluateAll((trs) =>
      trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent.trim())).filter((c) => c.length >= 4),
    );
    const thin = rows.filter((c) => Number(c[1]) < 5);
    const bad = thin.filter((c) => !/Not enough data yet/.test(c[3]));
    const badLabelled = rows.filter((c) => Number(c[1]) >= 5 && /Not enough/.test(c[3]) && c[2] !== '–');
    must(!bad.length && !badLabelled.length, `wrong labels: ${[...bad, ...badLabelled].map((c) => c.join('|')).join(' ; ')}`);
    flow.thinTopics = thin.map((c) => c[0]);
    flow.labelled = rows.filter((c) => /Strength|Needs work/.test(c[3])).map((c) => `${c[0]}:${c[3]}`);
    return `${rows.length} topic rows, ${thin.length} under 5 attempts, all "Not enough data yet"`;
  });
  await step('no other screen labels a thin topic', async () => {
    const hits = [];
    for (const r of ['/home', '/progress/review', '/learn/lessons', '/practice/daily']) {
      await page.goto(`${BASE}#${r}`);
      await settle(page, 500);
      const t = await page.locator('main').innerText();
      for (const topic of flow.thinTopics) {
        const re = new RegExp(`(weak|needs work|strength|strong)[^\\n]{0,40}${topic.replace(/[()]/g, '.')}|${topic.replace(/[()]/g, '.')}[^\\n]{0,40}(weak|needs work|strength|strong)`, 'i');
        if (re.test(t)) hits.push(`${r}: ${topic}`);
      }
    }
    must(!hits.length, `thin topic labelled elsewhere: ${hits.join(' ; ')}`);
    return `labelled topics: ${flow.labelled.join(', ')}`;
  });
  flow.errors = [...new Set(log)];
  await context.close();
}

async function flowSettings(vp) {
  startFlow(`13. Settings ${vp.tag}`);
  const { page, context, log } = await newPage(vp);
  await demo(page);
  await page.goto(`${BASE}#/settings`);
  await settle(page, 600);
  await step('change exam date and save', async () => {
    await page.locator('input[type="date"]').first().fill('2026-11-30');
    await page.getByRole('button', { name: 'Save changes' }).first().click();
    await settle(page);
    await page.goto(`${BASE}#/home`);
    await settle(page, 600);
    const t = await page.locator('main').innerText();
    return (t.match(/\d+ days? (left|to)[^\n]{0,20}/) ?? ['(no days-left text on Home)'])[0];
  });
  await step('change study minutes and save', async () => {
    await page.goto(`${BASE}#/settings`);
    await page.getByRole('tab', { name: 'Study' }).click().catch(() => {});
    await page.getByLabel('Weekday minutes').fill('90');
    await page.getByRole('button', { name: 'Save changes' }).first().click();
    await page.reload();
    await settle(page, 600);
    await page.getByRole('tab', { name: 'Study' }).click().catch(() => {});
    must((await page.getByLabel('Weekday minutes').inputValue()) === '90', 'minutes not kept');
  });
  await step('theme light / dark / system', async () => {
    await page.getByRole('tab', { name: 'Theme' }).click().catch(() => {});
    const out = [];
    for (const t of ['Dark', 'Light', 'System']) {
      await page.getByRole('radio', { name: t }).or(page.getByRole('button', { name: t, exact: true })).first().click();
      await settle(page, 250);
      out.push(`${t}:${await page.evaluate(() => document.documentElement.dataset.theme ?? document.documentElement.className)}`);
    }
    must(out[0] !== out[1], `theme did not change: ${out.join(' ')}`);
    return out.join(' ');
  });
  await step('export then import back', async () => {
    await page.getByRole('tab', { name: 'Your data' }).click().catch(() => {});
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), page.getByRole('button', { name: /Export/ }).first().click()]);
    const file = join(OUT, 'export.json');
    await dl.saveAs(file);
    must(JSON.parse(readFileSync(file, 'utf8')), 'export not JSON');
    await page.locator('input[type="file"]').setInputFiles(file);
    await settle(page);
    const rep = page.getByRole('button', { name: 'Replace my data' });
    if (await rep.count()) await rep.first().click();
    await settle(page);
    return `exported ${dl.suggestedFilename()}`;
  });
  await step('reset demo', async () => {
    await page.getByRole('button', { name: 'Reset demo' }).first().click();
    const confirm = page.getByRole('dialog').getByRole('button', { name: /Reset/ });
    if (await confirm.count()) await confirm.first().click();
    await settle(page, 700);
    return `lands on ${hash(page)}`;
  });
  flow.errors = [...new Set(log)];
  await context.close();
}

try {
  if (PART === 'all' || PART === 'routes') await auditRoutes();
  if (PART === 'all' || PART === 'flows' || PART.startsWith('flow:')) {
    const only = PART.startsWith('flow:') ? PART.slice(5) : null;
    const flows = { onboarding: flowOnboarding, demo: flowDemoPath, daily: flowDailySet, mock: flowMock, scoring: flowScoring, resume: flowResume, known: flowKnown, lessons: flowLessons, planner: flowPlanner, streak: flowStreak, rewards: flowRewards, analytics: flowAnalytics, settings: flowSettings };
    for (const [k, f] of Object.entries(flows)) {
      if (only && k !== only) continue;
      await f(VIEWPORTS[0]);
      if (k === 'demo' || k === 'onboarding' || k === 'known') await f(VIEWPORTS[1]);
    }
  }
} finally {
  await browser.close();
}

const file = join(OUT, `audit${PART === 'all' ? '' : '-' + PART.replace(':', '-')}.json`);
writeFileSync(file, JSON.stringify(results, null, 1));
const flagged = results.routes.filter((r) => r.flag);
console.log(`routes checked: ${new Set(results.routes.map((r) => r.route)).size} unique, ${results.routes.length} runs, ${flagged.length} flagged`);
for (const r of flagged) {
  const bits = [
    !r.renders && 'BLANK', r.errors.length && `errors[${r.errors.join(' ; ')}]`, r.overflow && `overflow ${r.overflow}`, !r.credit && 'no credit',
    r.forbidden.length && `forbidden ${r.forbidden.join(',')}`, !r.sampleOk && 'no Sample data', r.cut.length && `cut ${r.cut.join(',')}`,
    r.empty.length && `empty ${r.empty.join(',')}`, r.overlap.length && `overlap ${r.overlap.join(',')}`, r.deadHash && `href=# x${r.deadHash}`,
    r.badLinks.length && `bad links ${r.badLinks.join(',')}`, r.landed !== r.route.split('?')[0] && `→ ${r.landed}`,
  ].filter(Boolean);
  console.log(`  [${r.profile} ${r.vp}] ${r.route}: ${bits.join(' | ')}`);
}
for (const f of results.flows) {
  console.log(`${f.name}: ${f.result}${f.errors?.length ? ` errors[${f.errors.join(' ; ').slice(0, 300)}]` : ''}`);
  for (const s of f.steps) console.log(`  ${s.ok ? 'ok ' : 'XX '} ${s.label}${s.note ? ' — ' + s.note : ''}`);
}
