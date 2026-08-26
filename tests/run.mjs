#!/usr/bin/env node
/**
 * diag4free · UI-Abnahme
 *
 * Prüft die App in einem echten Browser auf Phone, Tablet und Desktop.
 * Kein Test-Framework — ein Skript, das entweder durchläuft oder mit
 * Exit-Code 1 abbricht. Passt zum Rest des Projekts: kein Build-Schritt.
 *
 *   node tests/run.mjs                 # startet selbst einen Server auf :8126
 *   BASE=http://localhost:8126 node tests/run.mjs   # gegen laufenden Server
 *
 * CDN-Requests (Fonts, marked, Fuse) werden abgewiesen — so testen wir den
 * Offline-Erstlauf, also genau den Fall Werkstatt ohne Netz.
 */

import { chromium, devices } from 'playwright';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8126;
const BASE = process.env.BASE || `http://localhost:${PORT}`;
const OWN_SERVER = !process.env.BASE;

const ROUTES = ['#/overview', '#/docs', '#/troubleshoot', '#/measure', '#/library', '#/software', '#/model/e88'];
const VIEWPORTS = [
  ['iPhone SE', devices['iPhone SE']],
  ['iPhone 13', devices['iPhone 13']],
  ['iPad',      devices['iPad (gen 7)']],
  ['Desktop',   { viewport: { width: 1440, height: 960 } }]
];
const CDN = '**://{api.fontshare.com,fonts.googleapis.com,fonts.gstatic.com,cdn.jsdelivr.net}/**';

let failures = 0, checks = 0;
const ok = (name) => { checks++; console.log(`  ✓ ${name}`); };
const fail = (name, detail) => { checks++; failures++; console.error(`  ✖ ${name}\n      ${detail}`); };
const expect = (cond, name, detail) => cond ? ok(name) : fail(name, detail);

async function newPage(browser, deviceSpec, errors, label) {
  const ctx = await browser.newContext({ ...deviceSpec, serviceWorkers: 'block' });
  await ctx.route(CDN, r => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(`${label}: ${e.message}`));
  return { ctx, page };
}

const settle = (page, ms = 900) => page.waitForTimeout(ms);

async function main() {
  let server;
  if (OWN_SERVER) {
    server = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 1200));
  }

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined
  });
  const errors = [];

  try {
    for (const [label, spec] of VIEWPORTS) {
      console.log(`\n▸ ${label}`);
      const { ctx, page } = await newPage(browser, spec, errors, label);
      const isTouch = label !== 'Desktop';

      // --- Jede Route rendert Inhalt und läuft nicht horizontal über ---
      for (const route of ROUTES) {
        await page.goto(BASE + '/' + route, { waitUntil: 'domcontentloaded' });
        await settle(page, 650);
        const html = (await page.locator('.view.active .view-inner').innerHTML()).trim();
        expect(html.length > 60, `${route} rendert Inhalt`, `nur ${html.length} Zeichen`);
        const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
        expect(!over, `${route} ohne horizontalen Overflow`, 'Seite scrollt seitwärts');
      }

      // --- Trichter: Fahrzeug → Motor → Cockpit ---
      await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'domcontentloaded' });
      await settle(page, 1300);

      const cards = await page.locator('[data-pick-model]').count();
      expect(cards > 0, 'Fahrzeugkarten vorhanden', 'keine Karte gefunden');

      // Fahrzeugkarten müssen ohne Scrollen erreichbar sein — sonst fehlt
      // die Einladung zum Tippen genau dort, wo sie wirken soll.
      if (isTouch) {
        const pos = await page.evaluate(() => {
          const c = document.querySelector('[data-pick-model]');
          return c ? { top: c.getBoundingClientRect().top, vh: window.innerHeight } : null;
        });
        expect(pos && pos.top < pos.vh - 60, 'erste Fahrzeugkarte über der Falz',
          pos ? `Karte bei ${Math.round(pos.top)}px, Viewport ${pos.vh}px` : 'keine Karte');
      }

      const bodyChips = await page.locator('[data-body]').count();
      expect(bodyChips > 1, 'Karosserie-Filter befüllt', `nur ${bodyChips} Chip(s) — body fehlt evtl. in index.json`);

      await page.locator('[data-body="Limousine"]').click();
      await settle(page, 350);
      const filtered = await page.locator('[data-pick-model]').count();
      expect(filtered > 0 && filtered < cards, 'Karosserie-Filter grenzt ein', `${filtered} von ${cards}`);
      await page.locator('[data-body="Alle"]').click();
      await settle(page, 250);

      await page.locator('[data-pick-model="e46"]').click();
      await settle(page, 900);
      expect(await page.locator('.dialog').isVisible(), 'Motorwahl öffnet nach Fahrzeugwahl', 'kein Dialog');
      const engines = await page.locator('[data-engine]').count();
      expect(engines > 0, 'Motorkarten vorhanden', 'keine Motorkarte');

      await page.locator('[data-engine]').first().click();
      await settle(page, 600);
      expect(await page.locator('.cockpit').count() === 1, 'Cockpit nach Motorwahl', 'kein Cockpit');
      expect(await page.locator('[data-route]').count() === 3, 'drei Wege ins Wissen', 'Routen fehlen');

      // --- Diagnose-Runner + Sitzung ---
      await page.goto(BASE + '/#/troubleshoot', { waitUntil: 'domcontentloaded' });
      await settle(page, 900);
      const guides = await page.locator('[data-select-guide]').count();
      if (guides > 0) {
        await page.locator('[data-select-guide]').first().click();
        await settle(page, 350);
        expect(await page.locator('.step-answerbar').isVisible(), 'Antwortleiste im Runner', 'keine Antwortleiste');

        if (isTouch) {
          // Antwortleiste darf die Tabbar nicht überlappen
          const bar = await page.locator('.step-answerbar').boundingBox();
          const tab = await page.locator('#tabbar').boundingBox();
          if (bar && tab) {
            const gap = Math.round(tab.y - (bar.y + bar.height));
            expect(gap >= 0, 'Antwortleiste überlappt die Tabbar nicht', `Überlappung ${-gap}px`);
          }
        }

        await page.locator('[data-answer="yes"]').click();
        await settle(page, 350);
        expect(await page.locator('.trail-item').count() > 0, 'Schritt-Spur wächst mit', 'keine Spur');
        const session = await page.evaluate(() => localStorage.getItem('diag4free.session.v1'));
        expect(!!session, 'Sitzung gespeichert', 'kein Sitzungs-Eintrag');

        await page.reload({ waitUntil: 'domcontentloaded' });
        await settle(page, 1200);
        expect(await page.locator('.resume-card').count() === 1, 'Wiederaufnahme nach Reload', 'keine Wiederaufnahme-Karte');
      }

      // --- Touch-Targets ---
      if (isTouch) {
        const small = await page.evaluate(() => [...document.querySelectorAll(
          '.tab,.answer,.fchip,.pick-card,.route,.cockpit-veh,.cockpit-eng,.trail-item,.btn,.icon-btn')]
          .filter(el => { const r = el.getBoundingClientRect(); return r.height > 0 && r.width > 0 && r.height < 44; })
          .map(el => `${el.className.split(' ')[0]}:${Math.round(el.getBoundingClientRect().height)}px`));
        expect(small.length === 0, 'alle Touch-Targets >= 44px', small.join(', '));
      }

      // --- Tabbar nur auf Touch ---
      const tabbarVisible = await page.locator('#tabbar').isVisible();
      expect(tabbarVisible === isTouch, `Tabbar ${isTouch ? 'sichtbar' : 'ausgeblendet'} auf ${label}`,
        `sichtbar=${tabbarVisible}, erwartet=${isTouch}`);

      await ctx.close();
    }

    // --- Kein JS-Fehler in irgendeinem Lauf (auch ohne CDN) ---
    console.log('');
    expect(errors.length === 0, 'keine JS-Fehler (auch ohne CDN/offline)', errors.join('\n      '));

  } finally {
    await browser.close();
    if (server) server.kill();
  }

  console.log(`\n${failures ? '✖' : '✓'}  ${checks - failures}/${checks} Prüfungen bestanden`);
  process.exit(failures ? 1 : 0);
}

main().catch(e => { console.error(`\n✖  ${e.message}`); process.exit(1); });
