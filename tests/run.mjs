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

// Misst den Kontrast jedes sichtbaren Textknotens gegen seinen tatsächlichen
// Hintergrund. Light- und Dark-Werte werden getrennt geprüft — Dark-Kontraste
// lassen sich nicht aus dem Light Mode ableiten.
const KONTRAST_SKRIPT = `(() => {
  const lum = c => { const [r,g,b] = c.map(v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
    return 0.2126*r + 0.7152*g + 0.0722*b; };
  const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(',').map(x => parseFloat(x)); return { rgb: p.slice(0,3), a: p.length>3 ? p[3] : 1 }; };
  const bgOf = el => { let n = el;
    while (n && n !== document.documentElement) { const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.5) return c.rgb; n = n.parentElement; }
    const b = parse(getComputedStyle(document.body).backgroundColor); return b ? b.rgb : [255,255,255]; };
  const ratio = (a,b) => { const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1,l2)+0.05) / (Math.min(l1,l2)+0.05); };
  const out = [];
  for (const el of document.querySelectorAll('p,span,dd,dt,li,h1,h2,h3,label,button,a,div')) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    if (r.bottom < 0 || r.right < 0) continue;
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
    if (txt.length < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
    const fg = parse(cs.color); if (!fg) continue;
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
    const soll = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    const k = ratio(fg.rgb, bgOf(el));
    if (k < soll) out.push(\`.\${(el.className||'').toString().split(' ')[0]} "\${txt.slice(0,30)}" \${Math.round(k*100)/100}:1 < \${soll}:1\`);
  }
  return [...new Set(out)];
})()`;

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

      // --- Messplan: Sollwert-Urteil, Persistenz, Motorfilter ---
      await page.goto(BASE + '/#/measure', { waitUntil: 'domcontentloaded' });
      await settle(page, 1300);
      const positionen = await page.locator('.measure-item').count();
      expect(positionen > 0, 'Messplan hat Positionen', 'keine Position');

      const eingaben = await page.locator('[data-value]').count();
      if (eingaben > 0) {
        // Es gibt numerische Sollwerte — dann muss die App auch urteilen.
        const erste = page.locator('[data-value]').first();
        const id = await erste.getAttribute('data-value');
        const box = () => page.locator(`[data-value="${id}"]`)
          .locator('xpath=ancestor::div[contains(@class,"measure-item")]');

        await erste.fill('999999');
        await settle(page, 200);
        let cls = await box().getAttribute('class');
        expect(cls.includes('v-ab'), 'Wert außerhalb wird als abweichend erkannt', `Klassen: ${cls}`);

        // Deutsches Dezimalkomma muss genauso greifen wie der Punkt
        await erste.fill('0,0001');
        await settle(page, 200);
        cls = await box().getAttribute('class');
        expect(/v-(ok|ab)/.test(cls), 'Dezimalkomma wird ausgewertet', `Klassen: ${cls}`);

        const gespeichert = await page.evaluate(() => localStorage.getItem('diag4free.checks.v2'));
        expect(!!gespeichert, 'Messwerte werden gespeichert', 'kein Eintrag unter checks.v2');

        await page.reload({ waitUntil: 'domcontentloaded' });
        await settle(page, 1300);
        const wert = await page.locator(`[data-value="${id}"]`).inputValue();
        expect(wert === '0,0001', 'Messwert übersteht den Reload', `gelesen: ${JSON.stringify(wert)}`);
      } else {
        ok('Messplan ohne numerische Sollwerte (measure.json fehlt — erwartet)');
      }

      // Abhaken hängt an der ID, nicht am Listenindex
      const ersteBox = page.locator('[data-check]').first();
      const checkId = await ersteBox.getAttribute('data-check');
      expect(checkId && !/^\d+$/.test(checkId), 'Abhak-Status hängt an einer stabilen ID',
        `data-check="${checkId}" sieht nach einem Index aus`);

      // --- Touch-Targets ---
      // Alle sichtbaren Bedienelemente, nicht eine gepflegte Selektorliste:
      // eine solche Liste übersieht genau das, was neu dazukommt oder wofür
      // eine CSS-Regel ins Leere zielt.
      if (isTouch) {
        const zuKlein = await page.evaluate(() => {
          const sichtbar = el => {
            if (el.closest('[aria-hidden="true"]') || el.closest('[hidden]')) return false;
            let n = el;
            while (n && n !== document.documentElement) {
              const cs = getComputedStyle(n);
              if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
              n = n.parentElement;
            }
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < innerWidth;
          };
          return [...new Set([...document.querySelectorAll('a,button,input,select,summary,[role="button"]')]
            .filter(sichtbar)
            // Ein kleines Steuerelement ist in Ordnung, wenn das zugehörige
            // Label die Trefferfläche trägt (pro-rules: Hitbox erweitern,
            // nicht das Symbol vergrößern).
            .filter(el => {
              if (el.getBoundingClientRect().height >= 44) return false;
              const lab = el.closest('label');
              return !(lab && lab.getBoundingClientRect().height >= 44);
            })
            .map(el => `${el.tagName.toLowerCase()}.${(el.className||'').toString().split(' ')[0]||'—'}:${Math.round(el.getBoundingClientRect().height)}px`))];
        });
        expect(zuKlein.length === 0, 'alle sichtbaren Touch-Targets >= 44px', zuKlein.join(', '));

        // Auch mit geöffneter Sidebar — dort saßen die Baureihen-Knöpfe bei 33 px
        await page.locator('#menuBtn').click();
        await settle(page, 450);
        const zuKleinOffen = await page.evaluate(() => {
          const r = el => el.getBoundingClientRect();
          return [...new Set([...document.querySelectorAll('#sidebar a, #sidebar button')]
            .filter(el => r(el).width > 0 && r(el).height > 0 && r(el).height < 44)
            .map(el => `${el.tagName.toLowerCase()}.${(el.className||'').toString().split(' ')[0]||'—'}:${Math.round(r(el).height)}px`))];
        });
        expect(zuKleinOffen.length === 0, 'Sidebar-Targets >= 44px', zuKleinOffen.join(', '));

        // Aus der Sidebar muss man wieder herauskommen, ohne die Baureihe zu
        // wechseln: sie überdeckt den Menü-Button, der sie geöffnet hat.
        const vorher = await page.locator('#ctxSeries').textContent();
        expect(await page.locator('[data-sidebar-backdrop]').isVisible(),
          'Sidebar hat einen Backdrop', 'kein sichtbarer Backdrop');
        const frei = await page.evaluate(() => {
          const sb = document.querySelector('#sidebar').getBoundingClientRect();
          return Math.round(window.innerWidth - sb.width);
        });
        expect(frei >= 44, 'Backdrop-Streifen breit genug zum Antippen', `nur ${frei}px frei`);
        // Rechter Rand des Backdrops — die Sidebar deckt die linke Hälfte ab.
        // (Feste 350 px lagen auf dem 320 px breiten iPhone SE außerhalb.)
        const bdBox = await page.locator('[data-sidebar-backdrop]').boundingBox();
        await page.locator('[data-sidebar-backdrop]').click({
          position: { x: Math.round(bdBox.width - 20), y: Math.round(bdBox.height / 2) }
        });
        await settle(page, 400);
        let offen = await page.locator('#sidebar').evaluate(el => el.classList.contains('open'));
        expect(!offen, 'Backdrop-Tap schließt die Sidebar', 'Sidebar bleibt offen');

        await page.locator('#menuBtn').click();
        await settle(page, 400);
        await page.keyboard.press('Escape');
        await settle(page, 300);
        offen = await page.locator('#sidebar').evaluate(el => el.classList.contains('open'));
        expect(!offen, 'Escape schließt die Sidebar', 'Sidebar bleibt offen');
        const nachher = await page.locator('#ctxSeries').textContent();
        expect(vorher === nachher, 'Schließen ändert die Baureihe nicht', `${vorher} → ${nachher}`);
      }

      // --- Tabbar nur auf Touch ---
      const tabbarVisible = await page.locator('#tabbar').isVisible();
      expect(tabbarVisible === isTouch, `Tabbar ${isTouch ? 'sichtbar' : 'ausgeblendet'} auf ${label}`,
        `sichtbar=${tabbarVisible}, erwartet=${isTouch}`);

      await ctx.close();
    }

    // --- Kein Content darf unerreichbar sein ---
    {
      console.log('\n▸ Erreichbarkeit des Contents');
      const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
      await ctx.route(CDN, r => r.abort());
      const page = await ctx.newPage();
      page.on('pageerror', e => errors.push(`Erreichbarkeit: ${e.message}`));
      await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
      await settle(page, 1300);

      // Jedes Doc und jeder Guide muss über eine Baureihe oder deren Gruppe
      // auffindbar sein. `content/f-series/` lag auf einer Gruppen-ID —
      // 2 Docs und 1 Diagnosepfad waren dadurch für niemanden sichtbar.
      const verwaist = await page.evaluate(async () => {
        const d = await (await fetch('./content/index.json')).json();
        const modelle = new Set(d.models.groups.flatMap(g => g.models.map(m => m.id)));
        const gruppen = new Set(d.models.groups.map(g => g.id));
        const erreichbar = id => modelle.has(id) || gruppen.has(id);
        return {
          docs: [...new Set(d.docs.filter(x => !erreichbar(x.model)).map(x => `${x.id}@${x.model}`))],
          guides: [...new Set(Object.values(d.guides).filter(g => !erreichbar(g.model)).map(g => `${g.id}@${g.model}`))]
        };
      });
      expect(verwaist.docs.length === 0, 'kein Doc ohne erreichbare Baureihe', verwaist.docs.join(', '));
      expect(verwaist.guides.length === 0, 'kein Guide ohne erreichbare Baureihe', verwaist.guides.join(', '));

      // Baureihenübergreifender Inhalt kommt an der konkreten Baureihe an
      await page.goto(BASE + '/#/model/f30', { waitUntil: 'domcontentloaded' });
      await settle(page, 1300);
      await page.goto(BASE + '/#/troubleshoot', { waitUntil: 'domcontentloaded' });
      await settle(page, 900);
      const gruppenGuides = await page.locator('[data-select-guide]').count();
      expect(gruppenGuides > 0, 'Gruppen-Guide erscheint bei F30', 'kein Diagnosepfad sichtbar');
      if (gruppenGuides > 0) {
        await page.locator('[data-select-guide]').first().click();
        await settle(page, 500);
        const frage = await page.locator('.step-question').count();
        expect(frage > 0, 'Gruppen-Guide lässt sich öffnen', 'kein Schritt gerendert');
      }

      // Leere Doc-Ansicht bietet einen Ausweg statt einer Sackgasse
      await page.goto(BASE + '/#/docs', { waitUntil: 'domcontentloaded' });
      await settle(page, 900);
      const karten = await page.locator('.doc-card').count();
      if (karten === 0) {
        const vorschlaege = await page.locator('[data-try-engine]').allTextContents();
        expect(vorschlaege.length > 0, 'leere Doc-Ansicht schlägt Motoren vor', 'keine Vorschläge');
        if (vorschlaege.length) {
          await page.locator('[data-try-engine]').first().click();
          await settle(page, 700);
          const jetzt = await page.locator('.doc-card').count();
          expect(jetzt > 0, 'vorgeschlagener Motor fördert Dokumente zutage',
            `nach Wechsel weiterhin ${jetzt} Karten — der Vorschlag war wirkungslos`);
        }
      } else {
        ok('Doc-Ansicht für F30 nicht leer');
      }
      await ctx.close();
    }

    // --- next_docs: nach der Diagnose weiterlesen ---
    {
      console.log('\n▸ Weiterführende Docs im Ergebnis');
      const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
      await ctx.route(CDN, r => r.abort());
      const page = await ctx.newPage();
      page.on('pageerror', e => errors.push(`next_docs: ${e.message}`));
      await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
      await settle(page, 1200);

      // Baureihe wählen, deren Ergebnisse next_docs führen — sonst prüft
      // der Test nichts und bestünde durch Überspringen.
      const ziel = await page.evaluate(async () => {
        const d = await (await fetch('./content/index.json')).json();
        for (const g of Object.values(d.guides)) {
          for (const r of Object.values(g._results || {})) {
            if ((r.next_docs || []).length) return g.model;
          }
        }
        return null;
      });
      expect(!!ziel, 'Content enthält Ergebnisse mit next_docs',
        'keine gefunden — dieser Test prüft dann nichts');

      if (ziel) {
        await page.goto(`${BASE}/#/model/${ziel}`, { waitUntil: 'domcontentloaded' });
        await settle(page, 1300);

        let gefunden = false;
        const guides = await (async () => {
          await page.goto(BASE + '/#/troubleshoot', { waitUntil: 'domcontentloaded' });
          await settle(page, 800);
          return page.locator('[data-select-guide]').count();
        })();

        for (let gi = 0; gi < guides && !gefunden; gi++) {
          for (const antwort of ['no', 'yes']) {
            await page.goto(BASE + '/#/troubleshoot', { waitUntil: 'domcontentloaded' });
            await settle(page, 700);
            const wieder = page.locator('[data-discard-session]');
            if (await wieder.count()) { await wieder.click(); await settle(page, 300); }
            if (!(await page.locator('[data-select-guide]').count())) break;
            await page.locator('[data-select-guide]').nth(gi).click();
            await settle(page, 400);
            for (let k = 0; k < 8; k++) {
              const b = page.locator(`[data-answer="${antwort}"]`);
              if (!(await b.count()) || !(await b.isVisible())) break;
              await b.click();
              await settle(page, 220);
            }
            if (await page.locator('.result-next-item').count() > 0) { gefunden = true; break; }
          }
        }
        expect(gefunden, 'Ergebnis zeigt weiterführende Docs an',
          'kein Ergebnis mit .result-next-item erreicht — next_docs wird nicht gerendert');

        if (gefunden) {
          await page.locator('.result-next-item').first().click();
          await settle(page, 700);
          const auf = await page.locator('[data-doc-drawer]').getAttribute('aria-hidden');
          expect(auf === 'false', 'weiterführendes Doc öffnet den Drawer', `aria-hidden=${auf}`);
        }
      }
      await ctx.close();
    }

    // --- Reduced Motion: Bewegung aus, App weiter bedienbar ---
    {
      console.log('\n▸ Reduced Motion');
      const ctx = await browser.newContext({
        ...devices['iPhone 13'], serviceWorkers: 'block', reducedMotion: 'reduce'
      });
      await ctx.route(CDN, r => r.abort());
      const page = await ctx.newPage();
      page.on('pageerror', e => errors.push(`ReducedMotion: ${e.message}`));
      await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
      await settle(page, 1300);
      const bewegt = await page.evaluate(() => [...document.querySelectorAll('*')]
        .filter(e => (getComputedStyle(e).transitionDuration || '')
          .split(',').some(v => parseFloat(v) > 0.05))
        .map(e => `${e.tagName.toLowerCase()}.${(e.className||'').toString().split(' ')[0]}`)
        .slice(0, 5));
      expect(bewegt.length === 0, 'keine Transition über 50ms bei reduced motion', bewegt.join(', '));
      const karten = await page.locator('[data-pick-model]').count();
      expect(karten > 0, 'App bleibt bei reduced motion bedienbar', 'keine Fahrzeugkarten');
      await ctx.close();
    }

    // --- Docs: Filter und Detail-Drawer ---
    {
      console.log('\n▸ Docs · Filter und Drawer');
      const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
      await ctx.route(CDN, r => r.abort());
      const page = await ctx.newPage();
      page.on('pageerror', e => errors.push(`Docs: ${e.message}`));
      await page.goto(BASE + '/#/docs', { waitUntil: 'domcontentloaded' });
      await settle(page, 1300);

      const alle = await page.locator('.doc-card').count();
      expect(alle > 0, 'Docs-Karten vorhanden', 'keine Karte');

      const chips = await page.locator('.chip').count();
      if (chips > 1) {
        await page.locator('.chip').nth(1).click();
        await settle(page, 400);
        const gefiltert = await page.locator('.doc-card').count();
        expect(gefiltert > 0 && gefiltert < alle, 'Kategorie-Chip grenzt ein', `${alle} → ${gefiltert}`);
        await page.locator('.chip').first().click();
        await settle(page, 300);
      }

      if (alle > 0) {
        await page.locator('.doc-card').first().click();
        await settle(page, 700);
        const zu = await page.locator('[data-doc-drawer]').getAttribute('aria-hidden');
        expect(zu === 'false', 'Doc-Drawer öffnet', `aria-hidden=${zu}`);
        expect(await page.locator('.drawer-backdrop').isVisible(),
          'Drawer hat sichtbaren Backdrop', 'kein Backdrop');
        await page.keyboard.press('Escape');
        await settle(page, 500);
        const wiederZu = await page.locator('[data-doc-drawer]').getAttribute('aria-hidden');
        expect(wiederZu === 'true', 'Escape schließt den Doc-Drawer', `aria-hidden=${wiederZu}`);
      }

      // Kein Doc darf im Drawer wie ein Defekt aussehen. 14 von 15
      // Artikelverweisen zeigen auf noch nicht geschriebene Dateien —
      // das ist ein offener Redaktionsstand, kein Ladefehler.
      const mitFehlertext = [];
      for (let i = 0; i < alle; i++) {
        await page.locator('.doc-card').nth(i).click();
        await settle(page, 550);
        const txt = await page.locator('.drawer-body').textContent();
        if (/konnte nicht geladen werden/.test(txt)) {
          mitFehlertext.push(await page.locator('.doc-card').nth(i).getAttribute('data-doc'));
        }
        await page.keyboard.press('Escape');
        await settle(page, 300);
      }
      expect(mitFehlertext.length === 0, 'kein Doc zeigt einen Artikel-Ladefehler',
        mitFehlertext.join(', '));

      // Inhaltsregel 3: gepflegte Quellen müssen auch sichtbar sein. Sie waren
      // in den Daten vorhanden, wurden aber nirgends gerendert.
      const belegt = await page.evaluate(async () => {
        const d = await (await fetch('./content/index.json')).json();
        return d.docs.filter(x => (x.sources || []).length).map(x => x.id);
      });
      if (belegt.length) {
        // Zu einer Baureihe wechseln, die belegte Docs hat — sonst prüft der
        // Test nichts und besteht durch Überspringen.
        const baureihe = await page.evaluate(async (ids) => {
          const d = await (await fetch('./content/index.json')).json();
          const doc = d.docs.find(x => ids.includes(x.id));
          return doc ? doc.model : null;
        }, belegt);
        if (baureihe) {
          await page.goto(`${BASE}/#/model/${baureihe}`, { waitUntil: 'domcontentloaded' });
          await settle(page, 1200);
        }
        await page.goto(BASE + '/#/docs', { waitUntil: 'domcontentloaded' });
        await settle(page, 900);
        let gezeigt = 0, geprueft = 0;
        const karten = await page.locator('.doc-card').count();
        for (let i = 0; i < karten; i++) {
          const id = await page.locator('.doc-card').nth(i).getAttribute('data-doc');
          if (!belegt.includes(id)) continue;
          geprueft++;
          await page.locator('.doc-card').nth(i).click();
          await settle(page, 500);
          if (await page.locator('.source-list li').count() > 0) gezeigt++;
          await page.keyboard.press('Escape');
          await settle(page, 300);
        }
        if (geprueft > 0) {
          expect(gezeigt === geprueft, 'Docs mit `sources` zeigen ihre Quellen an',
            `${gezeigt} von ${geprueft}`);
        } else {
          fail('Docs mit `sources` zeigen ihre Quellen an',
            `keine belegten Docs in Baureihe ${baureihe} sichtbar — der Test hätte nichts geprüft`);
        }
      }

      await ctx.close();
    }

    // --- Kontrast in beiden Themes ---
    for (const theme of ['light', 'dark']) {
      console.log(`\n▸ Kontrast · ${theme}`);
      const ctx = await browser.newContext({
        ...devices['iPhone 13'], serviceWorkers: 'block', colorScheme: theme
      });
      await ctx.route(CDN, r => r.abort());
      const page = await ctx.newPage();
      page.on('pageerror', e => errors.push(`Kontrast/${theme}: ${e.message}`));
      for (const route of ROUTES.slice(0, 6)) {
        await page.goto(BASE + '/' + route, { waitUntil: 'domcontentloaded' });
        await settle(page, 700);
        // Aktive Zustände mitprüfen — Primary-Flächen tauchen erst dort auf
        if (route === '#/troubleshoot') {
          const g = page.locator('[data-select-guide]');
          if (await g.count()) { await g.first().click(); await settle(page, 400); }
        }
        const verstoesse = await page.evaluate(KONTRAST_SKRIPT);
        expect(verstoesse.length === 0, `${route} Kontrast ${theme}`, verstoesse.join('\n      '));
      }
      await ctx.close();
    }

    // --- Querformat: Höhe ist dort das knappe Gut ---
    for (const [label, vp] of [['Phone quer', { width: 844, height: 390 }],
                               ['Tablet quer', { width: 1080, height: 810 }]]) {
      console.log(`\n▸ ${label}`);
      const ctx = await browser.newContext({
        viewport: vp, isMobile: true, hasTouch: true, deviceScaleFactor: 2, serviceWorkers: 'block'
      });
      await ctx.route(CDN, r => r.abort());
      const page = await ctx.newPage();
      page.on('pageerror', e => errors.push(`${label}: ${e.message}`));

      for (const route of ROUTES) {
        await page.goto(BASE + '/' + route, { waitUntil: 'domcontentloaded' });
        await settle(page, 600);
        const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
        expect(!over, `${route} ohne horizontalen Overflow (${label})`, 'Seite scrollt seitwärts');
      }

      // Die Diagnosefrage muss über der Antwortleiste stehen — sonst soll man
      // Ja/Nein tippen, ohne die Frage lesen zu können.
      await page.goto(BASE + '/#/troubleshoot', { waitUntil: 'domcontentloaded' });
      await settle(page, 900);
      const g = page.locator('[data-select-guide]');
      if (await g.count()) {
        await g.first().click();
        await settle(page, 500);
        const lage = await page.evaluate(() => {
          const q = document.querySelector('.step-question');
          const bar = document.querySelector('.step-answerbar');
          if (!q || !bar) return null;
          const qr = q.getBoundingClientRect(), br = bar.getBoundingClientRect();
          const fixiert = getComputedStyle(bar).position === 'fixed';
          return { ok: qr.top >= 0 && (!fixiert || qr.bottom <= br.top + 1), top: Math.round(qr.top), barTop: Math.round(br.top) };
        });
        expect(lage && lage.ok, `Diagnosefrage sichtbar (${label})`,
          lage ? `Frage bei ${lage.top}px, Antwortleiste bei ${lage.barTop}px` : 'Frage nicht gefunden');
      }
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
