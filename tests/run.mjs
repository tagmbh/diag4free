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
 * Findet Playwright seinen Browser nicht ("Executable doesn't exist"), liegt
 * das an einer Umgebung mit vorinstalliertem Chromium unter einem anderen
 * Pfad als dem, den die installierte Playwright-Version erwartet. Dann den
 * Pfad direkt setzen, statt einen zweiten Browser herunterzuladen:
 *
 *   CHROMIUM_PATH=$(find /opt/pw-browsers -name chrome -type f | head -1) \
 *     node tests/run.mjs
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

const ROUTES = ['#/overview', '#/docs', '#/troubleshoot', '#/measure', '#/library', '#/software', '#/scan', '#/model/e88'];
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
      // Eine feste Zahl war hier die falsche Zusicherung — sie brach, sobald
      // ein Weg dazukam, ohne dass etwas kaputt war. Geprueft gehoert, dass
      // die Wege da sind und der Scan darunter ist.
      const wege = await page.locator('[data-route]').evaluateAll(
        (els) => els.map(e => e.dataset.route));
      expect(wege.length >= 3, 'Wege ins Wissen vorhanden', `nur ${wege.length} Route(n)`);
      expect(wege.includes('scan'), 'Scan von der Uebersicht erreichbar', `Routen: ${wege.join(', ')}`);

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

        // Nach dem Reload steht der Schritt in der Adresse — die App kommt
        // deshalb direkt an derselben Frage heraus, nicht ueber eine
        // Wiederaufnahme-Karte. Das ist ein Griff weniger am Fahrzeug.
        const hashVorReload = await page.evaluate(() => location.hash);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await settle(page, 1200);
        expect(/^#\/guide\//.test(hashVorReload), 'Schritt steht in der Adresse', `Hash war ${hashVorReload}`);
        expect(await page.locator('[data-guide-runner]').count() === 1,
          'Reload landet wieder im Diagnosepfad', 'kein Runner nach Reload');
        expect(await page.locator('.trail-item').count() > 0,
          'Schritt-Spur ueberlebt den Reload', 'keine Spur nach Reload');

        // Die Wiederaufnahme-Karte ist fuer den anderen Fall da: Neustart
        // ohne Pfad in der Adresse. Dann muss sie erscheinen.
        // Wichtig: ein reiner Hashwechsel laedt die Seite nicht neu, der
        // Zustand im Speicher bliebe stehen. Fuer diesen Fall braucht es
        // einen echten Neustart.
        await page.goto(BASE + '/#/troubleshoot', { waitUntil: 'domcontentloaded' });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await settle(page, 1200);
        expect(await page.locator('.resume-card').count() === 1,
          'Wiederaufnahme-Karte ohne Pfad in der Adresse', 'keine Wiederaufnahme-Karte');

        // Zurueck muss zurueck heissen: der Browser-Knopf gehoert in die App,
        // nicht aus ihr heraus. Das war der teuerste Fehlgriff der alten
        // Fassung — ein Griff daneben und die halbe Fehlersuche war weg.
        await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
        await settle(page, 900);
        // Je nach Breite fuehrt die Seitenleiste oder die Tableiste dorthin —
        // genommen wird, was gerade sichtbar ist.
        await page.locator('[data-view="measure"]:visible').first().click();
        await settle(page, 500);
        await page.goBack();
        await settle(page, 500);
        expect(await page.evaluate(() => location.hash) === '#/overview',
          'Browser-Zurueck bleibt in der App', `Hash ${await page.evaluate(() => location.hash)}`);
      }

      // --- Tastaturfokus muss sichtbar sein ---
      // Und zwar anders sichtbar als Hover: in einem Kartenraster ist eine
      // blosse Farbaenderung der Umrandung kein Fokus, weil der Zeiger
      // dasselbe Bild erzeugt. Genau so stand es hier -- Hover und
      // Tastaturfokus teilten sich eine Regel, die die Umrandung aufhob.
      await page.goto(BASE + '/#/docs', { waitUntil: 'domcontentloaded' });
      await settle(page, 1200);
      // Chromium setzt :focus-visible bei einem Fokus aus dem Skript nur,
      // wenn zuletzt die Tastatur benutzt wurde. Ein Tab-Druck vorher macht
      // die Pruefung deshalb erst aussagekraeftig.
      await page.keyboard.press('Tab');
      await settle(page, 200);
      const fokusPruefung = await page.evaluate(() => {
        const el = document.querySelector('[data-view-panel="docs"] .doc-card');
        if (!el) return null;
        const vorher = getComputedStyle(el);
        const ruhe = { outline: vorher.outlineWidth, schatten: vorher.boxShadow };
        el.focus();
        const nachher = getComputedStyle(el);
        return {
          ruhe,
          fokus: { outline: nachher.outlineWidth, schatten: nachher.boxShadow },
          breite: parseFloat(nachher.outlineWidth) || 0
        };
      });
      if (fokusPruefung) {
        expect(fokusPruefung.breite >= 2,
          'Tastaturfokus zeichnet einen eigenen Ring',
          `outline-width ${fokusPruefung.fokus.outline}`);
        expect(fokusPruefung.fokus.outline !== fokusPruefung.ruhe.outline ||
               fokusPruefung.fokus.schatten !== fokusPruefung.ruhe.schatten,
          'Fokus unterscheidet sich vom Ruhezustand', 'kein sichtbarer Unterschied');
      }

      // --- Dokumente der Reihe nach durchgehen ---
      // Der Nutzer wollte die Tech-Docs "interaktiv durchgehen" koennen,
      // statt nach jedem Dokument zur Liste zurueckzuspringen.
      // Sauber starten: ein vorheriger Block kann eine Schublade offen
      // gelassen haben, und die faengt dann die Klicks ab.
      await page.goto(BASE + '/#/docs', { waitUntil: 'domcontentloaded' });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await settle(page, 1400);
      const ersteKarte = page.locator('[data-view-panel="docs"] [data-doc]').first();
      if (await ersteKarte.count() === 1) {
        await ersteKarte.click();
        await settle(page, 800);
        const blaettern = page.locator('.drawer-walk');
        if (await blaettern.count() === 1) {
          const posVorher = (await page.locator('.drawer-walk-pos').innerText()).trim();
          const weiter = page.locator('.drawer-walk [data-walk]').last();
          if (await weiter.isEnabled()) {
            const titelVorher = await page.locator('#drawerTitle').innerText();
            await weiter.click();
            await settle(page, 700);
            expect((await page.locator('#drawerTitle').innerText()) !== titelVorher,
              'Weiter zeigt das naechste Dokument', 'Titel unveraendert');
            expect((await page.locator('.drawer-walk-pos').innerText()).trim() !== posVorher,
              'Position wird mitgezaehlt', `weiterhin ${posVorher}`);
            // Geblaettert wird ueber dieselbe Schublade, also gehoert auch
            // dieser Schritt in die Historie.
            await page.goBack();
            await settle(page, 600);
            expect((await page.locator('#drawerTitle').innerText()) === titelVorher,
              'Zurueck fuehrt zum vorigen Dokument', 'anderer Titel nach Zurueck');
          }
        }
        await page.keyboard.press('Escape');
        await settle(page, 400);
      }

      // --- Tastatur im Diagnosepfad ---
      // Am Werkstattrechner liegt die Maus selten griffbereit. J und N
      // beantworten, Pfeil links geht zurueck — und beides muss denselben
      // Weg nehmen wie ein Klick, sonst laeuft die Historie auseinander.
      await page.goto(BASE + '/#/troubleshoot', { waitUntil: 'domcontentloaded' });
      await settle(page, 1200);
      const tastaturGuide = page.locator('[data-view-panel="troubleshoot"] [data-select-guide]').first();
      if (await tastaturGuide.count() === 1) {
        await tastaturGuide.click();
        await settle(page, 600);
        const hashStart = await page.evaluate(() => location.hash);
        await page.keyboard.press('j');
        await settle(page, 500);
        const hashNachJa = await page.evaluate(() => location.hash);
        expect(hashNachJa !== hashStart, 'Taste J beantwortet den Schritt', 'nichts passiert');
        await page.keyboard.press('ArrowLeft');
        await settle(page, 500);
        expect(await page.evaluate(() => location.hash) === hashStart,
          'Pfeil links geht denselben Schritt zurueck', 'Zustand stimmt nicht mehr');

        // Waehrend in einem Feld getippt wird, darf keine dieser Tasten
        // greifen. Auf schmalen Geraeten ist das Kopfzeilen-Suchfeld
        // ausgeblendet — dann gibt es diesen Fall dort nicht zu pruefen.
        const suchfeld = page.locator('#globalSearch');
        if (await suchfeld.isVisible()) {
          await suchfeld.focus();
          await page.keyboard.type('jn');
          await settle(page, 300);
          expect(await suchfeld.inputValue() === 'jn',
            'Tastenkuerzel greifen nicht im Eingabefeld', 'Eingabe wurde abgefangen');
          await page.evaluate(() => { const el = document.querySelector('#globalSearch'); el.value = ''; el.blur(); });
          await settle(page, 300);
        }
      }

      // --- Erststart: kurze Einfuehrung, danach nie wieder ---
      // Der Start wirkte "plump": sechzehn Karten, kein Wort dazu. Die
      // Einfuehrung darf aber nicht selbst zum Hindernis werden — die
      // Falz-Pruefung oben laeuft mit ihr zusammen.
      await page.evaluate(() => localStorage.clear());
      // Ein Sprung auf dieselbe Adresse laedt nicht neu — ohne echten
      // Neustart bliebe der Zustand im Speicher stehen.
      await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await settle(page, 1300);
      expect(await page.locator('.welcome').count() === 1,
        'Erststart zeigt eine Einfuehrung', 'kein Willkommensblock');
      // Erste Wahl treffen — danach ist der Browser kein Erstnutzer mehr.
      await page.locator('[data-view-panel="overview"] [data-pick-model]').first().click();
      await settle(page, 700);
      await page.keyboard.press('Escape');
      await settle(page, 400);
      await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await settle(page, 1200);
      expect(await page.locator('.welcome').count() === 0,
        'Einfuehrung erscheint nur einmal', 'Willkommensblock kam wieder');

      // --- Uebersicht gegen Bibliothek: beide sagen, was sie sind ---
      // Der Nutzer konnte die beiden nicht auseinanderhalten. Der Test
      // haelt fest, dass die Bibliothek ihren Bezugsrahmen nennt und einen
      // sichtbaren Weg zurueck an den gefilterten Arbeitsplatz traegt.
      await page.goto(BASE + '/#/library', { waitUntil: 'domcontentloaded' });
      await settle(page, 1200);
      expect(await page.locator('[data-view-panel="library"] .scope-note').count() === 1,
        'Bibliothek nennt ihren Bezugsrahmen', 'kein Hinweis auf den Geltungsbereich');
      const zurueckKnopf = page.locator('[data-view-panel="library"] .scope-note [data-route="overview"]');
      expect(await zurueckKnopf.count() === 1, 'Weg zurueck in den Arbeitsbereich vorhanden', 'kein Rueckweg');
      await zurueckKnopf.click();
      await settle(page, 700);
      expect(await page.evaluate(() => location.hash) === '#/overview',
        'Rueckweg fuehrt in die Uebersicht', `Hash ${await page.evaluate(() => location.hash)}`);

      // Das Fahrzeugschild traegt die Auswahl und fuehrt zum Wechseln.
      const schild = page.locator('#ctxChip');
      expect(await schild.count() === 1, 'Fahrzeugschild vorhanden', 'kein Schild in der Kopfzeile');
      expect((await schild.innerText()).trim().length > 0,
        'Fahrzeugschild zeigt die Auswahl', 'Schild ist leer');
      await schild.click();
      await settle(page, 700);
      expect(await page.locator('[data-pick-model], .pick-card').count() > 0,
        'Fahrzeugschild fuehrt in die Fahrzeugwahl', 'keine Fahrzeugauswahl nach Klick');

      // --- Symptom-Einstieg: die erste Frage ist "Was ist los?" ---
      await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
      await settle(page, 1400);
      const symHost = page.locator('#symptomeHost');
      if (await symHost.count() === 1 && !(await symHost.isHidden())) {
        const knoepfe = page.locator('.sym-knopf');
        const n = await knoepfe.count();
        expect(n > 0, 'Symptome zur Auswahl vorhanden', 'keine Symptomknöpfe');
        if (n > 0) {
          await knoepfe.first().click();
          await settle(page, 400);
          expect(await knoepfe.first().getAttribute('aria-pressed') === 'true',
            'Symptomauswahl wird gemeldet', 'aria-pressed nicht gesetzt');
          expect(await page.locator('.sym-weg').count() > 0,
            'Symptom führt zu einem Weg', 'keine Ursache mit Weg');
          // Ein Ziel ohne Weg waere genau die Sackgasse, die der Nutzer
          // als "0 Docs" schon gesehen hat.
          for (const el of await page.locator('.sym-weg').all()) {
            const box = await el.boundingBox();
            if (box) expect(box.height >= 44, 'Symptomweg ist berührbar', `nur ${Math.round(box.height)}px hoch`);
          }
        }
      }

      // --- Glossar: Abkürzungen sind einen Klick von ihrer Erklärung weg ---
      await page.goto(BASE + '/#/library', { waitUntil: 'domcontentloaded' });
      await settle(page, 1400);
      // Nur in der sichtbaren Ansicht suchen: die uebrigen Panels bleiben im
      // DOM stehen, und ein Treffer dort ist unklickbar.
      const mitArtikelKarte = page.locator('[data-view-panel="library"] [data-doc]').first();
      if (await mitArtikelKarte.count() === 1) {
        await mitArtikelKarte.click();
        await settle(page, 900);
        const begriffe = page.locator('#articleContent .gl-term');
        if (await begriffe.count() > 0) {
          const hashVorher = await page.evaluate(() => location.hash);
          await begriffe.first().click();
          await settle(page, 400);
          expect(await page.locator('.gl-dialog').isVisible(),
            'Glossar öffnet die Erklärung', 'kein sichtbarer Glossar-Dialog');
          await page.keyboard.press('Escape');
          await settle(page, 400);
          // Der Dialog bleibt im DOM und wird ausgeblendet — gemessen wird
          // deshalb die Sichtbarkeit, nicht die Existenz.
          expect(!(await page.locator('.gl-dialog').isVisible()),
            'Esc schließt die Erklärung', 'Dialog blieb sichtbar');
          expect(await page.locator('.drawer').getAttribute('aria-hidden') === 'false',
            'Esc trifft nur die Erklärung, nicht den Artikel', 'die Schublade ging mit zu');
          // Das Glossar ist eine Einblendung, keine Seite: es darf die
          // Historie nicht anfassen, sonst zeigt der Zurück-Knopf ins Leere.
          expect(await page.evaluate(() => location.hash) === hashVorher,
            'Glossar fasst die Historie nicht an', 'Hash hat sich geändert');
        }
      }

      // --- Silhouetten: jede Baureihe muss anders aussehen ---
      // Der Nutzer hat genau das gemeldet: sechzehn Karten, eine Zeichnung.
      // Der Test haelt fest, dass es nicht wieder dahin zurueckfaellt.
      await page.evaluate(() => localStorage.clear());
      await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
      await settle(page, 1300);
      const formen = await page.$$eval('.pick-art svg path', ns => ns.map(n => n.getAttribute('d')));
      if (formen.length > 4) {
        expect(new Set(formen).size === formen.length,
          'Fahrzeugkarten zeigen verschiedene Silhouetten',
          `${formen.length} Pfade, davon nur ${new Set(formen).size} verschieden`);
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

    // --- engines.json: geliefertes Schema wird verstanden ---
    {
      console.log('\n▸ Motor-Steckbriefe');
      const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
      await ctx.route(CDN, r => r.abort());
      const page = await ctx.newPage();
      page.on('pageerror', e => errors.push(`engines: ${e.message}`));
      await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'domcontentloaded' });
      await settle(page, 1500);

      const vorhanden = await page.evaluate(async () => {
        try {
          const r = await fetch('./content/engines.json');
          if (!r.ok) return null;
          const d = await r.json();
          const liste = Array.isArray(d.engines) ? d.engines
                      : Array.isArray(d) ? d : Object.keys(d).map(k => ({ id: k }));
          return liste.length;
        } catch { return null; }
      });

      if (vorhanden) {
        // Eine Baureihe wählen, deren Motoren im Steckbrief-Bestand vorkommen.
        // Das erste Fahrzeug der Liste trifft sonst zufällig einen Bestand
        // ohne Überschneidung und der Test schlägt zu Unrecht an.
        const passend = await page.evaluate(async () => {
          const [idx, eng] = await Promise.all([
            (await fetch('./content/index.json')).json(),
            (await fetch('./content/engines.json')).json()
          ]);
          const liste = Array.isArray(eng.engines) ? eng.engines
                      : Array.isArray(eng) ? eng : Object.keys(eng).map(k => ({ id: k }));
          const bekannt = new Set(liste.map(e => e.id || e.code || e.name).filter(Boolean));
          const m = idx.models.groups.flatMap(g => g.models)
            .find(x => (x.engines || []).some(e => bekannt.has(e)));
          return m ? m.id : null;
        });
        expect(!!passend, 'Baureihe mit bekannten Motoren gefunden',
          'kein Modell überschneidet sich mit engines.json');
        if (!passend) { await ctx.close(); throw new Error('abbruch'); }

        await page.locator(`[data-pick-model="${passend}"]`).click();
        await settle(page, 1000);
        const karten = await page.locator('[data-engine]').count();
        const gezeichnet = await page.locator('[data-engine] .eng-svg').count();
        expect(karten > 0, 'Motorkarten vorhanden', 'keine');
        expect(gezeichnet > 0, 'mindestens ein Motorschema gezeichnet',
          `${karten} Karten, aber 0 Schemata — engines.json wurde nicht verstanden`);
      } else {
        ok('engines.json nicht vorhanden — Motorkarten bleiben textbasiert (erwartet)');
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
      // Alle Hash-Routen, nicht die ersten sechs: ein Index laesst jede
      // neu dazukommende Ansicht stillschweigend ungeprueft.
      for (const route of ROUTES.filter(r => !r.startsWith('#/model'))) {
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

    // --- Kein Dokument ist eine Sackgasse ---
    // Seit die Quellenverweise nach draussen entfallen sind, traegt der
    // Weg tiefer die Navigation allein: ein Artikel oder Verweise auf
    // verwandte Dokumente. Ein Doc ohne beides ist eine Stelle, an der
    // der Leser haengenbleibt — und das faellt sonst niemandem auf, weil
    // jede einzelne Ansicht fuer sich richtig aussieht.
    {
      console.log('\n▸ Wege tiefer');
      const { ctx, page } = await newPage(browser, devices['iPhone 13'], errors, 'Tiefe');
      await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
      await settle(page, 1000);
      const ids = await page.evaluate(async () =>
        (await (await fetch('./content/index.json')).json()).docs.map(d => d.id));

      const ohne = [];
      for (const id of ids) {
        await page.goto(BASE + `/#/docs/${id}`, { waitUntil: 'domcontentloaded' });
        await settle(page, 400);
        const r = await page.evaluate(() => ({
          links: document.querySelectorAll('.detail-link[data-doc]').length,
          artikel: document.querySelector('#articleContent')?.innerHTML.length || 0
        }));
        if (r.links === 0 && r.artikel < 400) ohne.push(id);
      }
      expect(ohne.length === 0, `alle ${ids.length} Docs mit Weg tiefer`, ohne.join(', '));

      // Und der Verweis muss auch wirklich zum naechsten Dokument fuehren
      const zielId = await page.evaluate(() => {
        const b = document.querySelector('.detail-link[data-doc]');
        return b ? b.dataset.doc : null;
      });
      if (zielId) {
        await page.locator('.detail-link[data-doc]').first().click();
        await settle(page, 500);
        const titel = await page.locator('#drawerSubtitle').textContent();
        expect(titel.includes(zielId), 'Verweis öffnet das verwandte Dokument', `Untertitel: ${titel}`);
      } else fail('Verweis öffnet das verwandte Dokument', 'kein Verweis zum Anklicken gefunden');

      await ctx.close();
    }

    // --- Artikel ---
    // Der ausfuehrliche Teil der Wissensbasis wird von einem eigenen
    // Renderer dargestellt. Faellt der aus oder trifft er eine Syntax
    // nicht, sieht der Leser Rautezeichen und Pipe-Tabellen statt eines
    // Artikels — und zwar in jedem der Artikel gleichzeitig. Der Lauf
    // hier blockiert weiterhin alle CDN-Anfragen, prueft also genau den
    // Werkstattfall ohne Netz.
    {
      console.log('\n▸ Artikel');
      const { ctx, page } = await newPage(browser, devices['iPhone 13'], errors, 'Artikel');
      await page.goto(BASE + '/#/overview', { waitUntil: 'domcontentloaded' });
      await settle(page, 1200);

      const artikel = await page.evaluate(async () => {
        const idx = await (await fetch('./content/index.json')).json();
        return idx.docs.filter(d => d.article).map(d => ({ id: d.id, series: d.series || d.model, datei: d.article }));
      });
      expect(artikel.length > 0, 'Docs mit Artikel gefunden', 'keiner');

      let geprueft = 0, leer = [], rest = [], fehlend = [];
      for (const a of artikel) {
        const erg = await page.evaluate(async (a) => {
          const r = await fetch(`./content/${a.series}/${a.datei}`);
          if (!r.ok) return { fehlt: true };
          const html = window.D4F_MD.parse(await r.text(), { ohneTitel: true });
          const box = document.createElement('div');
          box.innerHTML = html;
          // Sichtbarer Text ohne Tags: bleibt darin Markdown-Syntax
          // stehen, hat der Renderer sie nicht erkannt.
          const text = box.textContent;
          return {
            laenge: html.length,
            tags: box.querySelectorAll('h2,p,li,td,blockquote,code').length,
            restMd: /\|\s*-{2,}|\*\*|^#{1,6}\s|\[[^\]]+\]\([^)]+\)/m.test(text),
            leereZellen: [...box.querySelectorAll('tr')].some(tr => tr.children.length === 0)
          };
        }, a);
        if (erg.fehlt) { fehlend.push(a.id); continue; }
        geprueft++;
        if (erg.laenge < 400 || erg.tags < 5) leer.push(`${a.id}(${erg.laenge}Z/${erg.tags}tags)`);
        if (erg.restMd) rest.push(a.id);
      }

      expect(geprueft > 0, `Artikel gerendert (${geprueft} von ${artikel.length})`, 'keiner gerendert');
      expect(rest.length === 0, 'kein rohes Markdown im gerenderten Text', rest.join(', '));
      expect(leer.length === 0, 'jeder Artikel hat Substanz', leer.join(', '));

      // Fehlende Artikeldateien sind kein Fehler — die App zeigt dort
      // einen Hinweis. Gemeldet werden sie trotzdem.
      if (fehlend.length) console.log(`  · ${fehlend.length} geplante(r) Artikel noch nicht geschrieben`);

      // Und einmal durch die echte Oberflaeche, nicht nur durch den Parser.
      //
      // Wichtig: ein Doc nehmen, dessen Artikel auch wirklich existiert.
      // `artikel[0]` war das falsche Kriterium — steht dort ein geplanter,
      // noch nicht geschriebener Artikel, zeigt die App korrekt einen
      // Hinweis statt eines Artikels, und der Test meldete einen Fehler,
      // wo keiner war. Genau das ist in CI passiert.
      const geschrieben = [];
      for (const a of artikel) {
        const da = await page.evaluate(
          async (a) => (await fetch(`./content/${a.series}/${a.datei}`)).ok, a);
        if (da) geschrieben.push(a);
      }
      expect(geschrieben.length > 0, 'mindestens ein geschriebener Artikel vorhanden',
        `${artikel.length} geplant, keiner geschrieben`);
      const mitArtikel = geschrieben[0];
      await page.goto(BASE + `/#/docs/${mitArtikel?.id}`, { waitUntil: 'domcontentloaded' });
      await settle(page, 1200);
      const imDrawer = await page.evaluate(() => {
        const el = document.querySelector('#articleContent');
        if (!el) return null;
        return { laenge: el.innerHTML.length, ueber: el.querySelectorAll('h2').length,
                 roh: /^#|\|\s*-{2,}/m.test(el.textContent) };
      });
      expect(imDrawer && imDrawer.laenge > 400, 'Artikel erscheint im Drawer',
        imDrawer ? `nur ${imDrawer.laenge} Zeichen` : 'kein #articleContent');
      expect(imDrawer && !imDrawer.roh, 'Drawer zeigt kein rohes Markdown', 'Syntax sichtbar');

      // Breite Tabellen duerfen die Seite nicht seitwaerts schieben
      const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(!over, 'Artikel ohne horizontalen Overflow', 'Seite scrollt seitwärts');

      await ctx.close();
    }

    // --- OBD-Scan ---
    // Der Scan haengt an Geraete-APIs, die es nicht ueberall gibt. Genau
    // dieser Fall ist hier der Normalfall: der Testbrowser hat weder Web
    // Serial noch Web Bluetooth. Er muss dann erklaeren statt einen Knopf
    // anzubieten, der nur eine Ausnahme wirft.
    {
      console.log('\n▸ OBD-Scan');
      const { ctx, page } = await newPage(browser, VIEWPORTS[0][1], errors, 'Scan');
      await page.goto(BASE + '/#/scan', { waitUntil: 'domcontentloaded' });
      await settle(page, 800);

      const kann = await page.evaluate(() => window.OBD.support());
      const inhalt = await page.locator('.view.active .view-inner').innerText();

      expect(inhalt.trim().length > 60, 'Scan rendert Inhalt', 'Ansicht leer');

      if (!kann.serial && !kann.bluetooth) {
        expect(await page.locator('.scan-note').count() > 0,
          'Scan erklaert fehlende Geraete-Unterstuetzung', 'kein Hinweis');
        expect(await page.locator('[data-scan-connect]').count() === 0,
          'kein toter Verbinden-Knopf ohne Geraete-API', 'Knopf trotz fehlender API');
      } else {
        expect(await page.locator('[data-scan-connect]').count() > 0,
          'Verbinden-Knopf vorhanden', 'kein Knopf trotz API');
      }

      // Die Grenze der genormten OBD-Ebene muss dastehen — sonst sucht
      // jemand hier vergeblich nach dem Verdeck-Steuergeraet.
      const nenntGrenze = /Komfort|Karosserie|genormte/i.test(inhalt);
      expect(nenntGrenze, 'Scan benennt seine Grenze', 'kein Hinweis auf die Protokollgrenze');

      // Fehlercode-Dekodierung: die Umrechnung von zwei Bytes in P0133
      // ist die eine Stelle, an der ein Vorzeichenfehler unbemerkt falsche
      // Codes anzeigen wuerde.
      const codes = await page.evaluate(() => [
        window.OBD.decodeDtc(0x01, 0x33),
        window.OBD.decodeDtc(0xC1, 0x23),
        window.OBD.decodeDtc(0x43, 0x0A),
        window.OBD.decodeDtc(0x80, 0x00)
      ]);
      expect(JSON.stringify(codes) === JSON.stringify(['P0133', 'U0123', 'C030A', 'B0000']),
        'Fehlercodes korrekt dekodiert', `bekommen: ${codes.join(', ')}`);

      // Der Scan spricht genormtes OBD-2. Ein Teil der Baureihen, die der
      // Trichter anbietet, kennt das gar nicht — dort fuehrt der
      // Verbinden-Knopf ins Leere. Die Ansicht muss das vorher sagen,
      // abhaengig vom gewaehlten Fahrzeug.
      for (const [serie, erwartet] of [['e30', true], ['e46', true], ['e90', false]]) {
        await page.goto(BASE + `/#/model/${serie}`, { waitUntil: 'domcontentloaded' });
        await settle(page, 400);
        await page.goto(BASE + '/#/scan', { waitUntil: 'domcontentloaded' });
        await settle(page, 600);
        const da = await page.locator('.scan-note-warn').count() > 0;
        expect(da === erwartet,
          `Scan-Eignungshinweis bei ${serie} ${erwartet ? 'vorhanden' : 'nicht vorhanden'}`,
          `Hinweis ${da ? 'da' : 'fehlt'}, erwartet ${erwartet ? 'da' : 'weg'}`);
      }

      // Der verbundene Zustand rendert Flaechen, die es im Ruhezustand
      // nicht gibt: die getoenten Fehlercode-Zeilen und die Live-Kacheln.
      // Genau dort bricht Kontrast. Ohne Adapter kommt man da nur hin,
      // indem man den OBD-Layer durch eine Attrappe ersetzt.
      await page.evaluate(() => {
        const echt = window.OBD;
        window.OBD = {
          ...echt,
          support: () => ({ secure: true, serial: true, bluetooth: false }),
          connectSerial: async () => ({ art: 'serial', name: 'Attrappe' }),
          init: async (melde) => { melde('Bereit'); },
          readStatus: async () => ({ mil: true, anzahl: 3 }),
          readVin: async () => 'WBAVA31090NL12345',
          readDtcs: async () => ([
            { code: 'P0133', art: 'gespeichert', hinweis: 'Bestätigter Fehler, MIL kann leuchten.', herkunft: 'Antrieb · genormt' },
            { code: 'P1345', art: 'sporadisch',  hinweis: 'Einmal aufgetreten, noch nicht bestätigt.', herkunft: 'Antrieb · herstellerspezifisch' },
            { code: 'U0100', art: 'dauerhaft',   hinweis: 'Löscht sich erst nach bestandener Eigenprüfung.', herkunft: 'Netzwerk · genormt' }
          ]),
          readSupportedPids: async () => ['0C', '05', '0D'],
          livePoll: (pids, beiWert) => {
            beiWert({ pid: '0C', name: 'Drehzahl', einheit: '1/min', wert: 820, min: 0, max: 8000 });
            beiWert({ pid: '05', name: 'Kühlmitteltemperatur', einheit: '°C', wert: 91, min: -40, max: 215 });
            beiWert({ pid: '0D', name: 'Geschwindigkeit', einheit: 'km/h', wert: 0, min: 0, max: 255 });
            return () => {};
          },
          disconnect: async () => {}
        };
      });
      // Kein goto: ein echter Seitenwechsel wuerde die Attrappe wieder
      // durch den echten Layer ersetzen. Ein hashchange genuegt, um die
      // Ansicht neu zeichnen zu lassen.
      await page.evaluate(() => {
        location.hash = '#/overview';
        location.hash = '#/scan';
      });
      await settle(page, 400);

      await page.locator('[data-scan-connect="serial"]').click();
      await settle(page, 500);
      expect(await page.locator('.scan-head').count() > 0, 'verbundener Zustand erreichbar', 'kein Kopfbereich');
      expect(await page.locator('.scan-mil.on').count() > 0, 'Motorkontrollleuchte wird gemeldet', 'keine MIL-Anzeige');

      await page.locator('[data-scan-read]').click();
      await settle(page, 400);
      expect(await page.locator('.dtc-item').count() === 3, 'Fehlercodes gelistet',
        `${await page.locator('.dtc-item').count()} statt 3`);

      await page.locator('[data-scan-live]').click();
      await settle(page, 400);
      expect(await page.locator('.live-tile').count() === 3, 'Live-Kacheln gezeichnet',
        `${await page.locator('.live-tile').count()} statt 3`);

      const scanVerstoesse = await page.evaluate(KONTRAST_SKRIPT);
      expect(scanVerstoesse.length === 0, 'Kontrast im verbundenen Zustand', scanVerstoesse.join('\n      '));

      // Trefferflaechen im Scan: die Verbindungsknoepfe und die
      // Aktionsleiste sind das, was mit oeligen Fingern getroffen werden
      // muss. Ein 33px-Knopf faellt sonst erst in der Werkstatt auf.
      const scanKlein = await page.evaluate(() => [...document.querySelectorAll(
          '#scanPanel a, #scanPanel button')]
        .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 44; })
        .map(el => `${(el.className||'').toString().split(' ')[0]}:${Math.round(el.getBoundingClientRect().height)}px`));
      expect(scanKlein.length === 0, 'Scan-Bedienelemente >= 44px', scanKlein.join(', '));

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
