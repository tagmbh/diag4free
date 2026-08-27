/* ============================================================
   diag4free — Parametrische Fahrzeug- und Motorgrafik
   Vanilla, kein Build-Schritt. Exportiert window.D4F_GFX.

   Warum gezeichnet statt fotografiert:
   - Offline-PWA: SVG kostet Bytes im dreistelligen Bereich, Fotos Megabytes
   - Korrektheit: ein generiertes "Foto" eines N54 wäre ein erfundener Motor.
     Hier ergibt sich jede Zeichnung aus echten Daten (Karosserieform,
     Zylinderzahl, Anordnung, Aufladung) — was man sieht, stimmt.
   - Lizenz: keine fremden Schnittbilder oder 3D-Modelle im öffentlichen Repo
   - Theming: currentColor, damit Light/Dark ohne zweiten Satz Assets geht
   ============================================================ */

(() => {
  'use strict';

  // -------- Fahrzeug-Silhouetten --------
  // Oberkante je Karosserieform; unten auf der Schwellerlinie geschlossen.
  // Die Räder überlappen den Schweller — genau so liest sich eine Seitenansicht.
  const BODIES = {
    Limousine:   { top: 'L10,46 L34,42 L58,27 L120,27 L146,42 L190,46', tail: 190, wheels: [52, 150], r: 12 },
    Coupe:       { top: 'L10,47 L34,43 L60,29 L108,29 L152,44 L190,47', tail: 190, wheels: [52, 150], r: 12 },
    Cabrio:      { top: 'L10,46 L34,42 L58,29 L74,29 L150,41 L190,45', tail: 190, wheels: [52, 150], r: 12 },
    Schraegheck: { top: 'L10,46 L32,42 L56,27 L124,28 L150,45 L174,46', tail: 174, wheels: [48, 138], r: 12 },
    SUV:         { top: 'L8,42 L30,37 L50,19 L138,19 L158,37 L192,42',  tail: 192, wheels: [50, 152], r: 14 }
  };

  const SILL = 58;

  /**
   * Seitenansicht einer Baureihe.
   * @param {string} body  Karosserieform aus models.json (`body`)
   * @param {string} era   'classic' | 'modern' — steuert nur die Kantenführung
   */
  const vehicleSvg = (body, era = 'modern') => {
    const b = BODIES[body] || BODIES.Limousine;
    const join = era === 'classic' ? 'miter' : 'round';
    const wheels = b.wheels.map(cx => `
      <circle cx="${cx}" cy="${SILL}" r="${b.r}" fill="none" stroke="currentColor" stroke-width="2.5"/>
      <circle cx="${cx}" cy="${SILL}" r="${Math.round(b.r * 0.35)}" fill="currentColor" opacity="0.5"/>`).join('');

    return `<svg class="veh-svg" viewBox="0 0 200 78" fill="none" role="img" aria-hidden="true"
      stroke="currentColor" stroke-width="2.5" stroke-linejoin="${join}" stroke-linecap="round">
      <path d="M10,${SILL} ${b.top} L${b.tail},${SILL} Z" fill="currentColor" fill-opacity="0.07"/>
      ${wheels}
      <line x1="4" y1="72" x2="196" y2="72" stroke-width="1.5" opacity="0.25"/>
    </svg>`;
  };

  // -------- Motor-Schemata (isometrisch) --------
  // Aus `layout` (R4/R6/V8…) und `aspiration` (Sauger/Turbo/…) gezeichnet.
  // Wer hinschaut, zählt die Bohrungen und sieht die Anordnung — genau das,
  // was zur Identifikation im Motorraum nötig ist.

  // Die Bauform kommt aus engines.json, also von aussen. Wer sie schreibt,
  // hat nicht dieselbe Tabelle im Kopf wie dieser Code: R6, I6 und L6
  // meinen denselben Reihensechszylinder, B4 und H4 denselben Boxer.
  // Ein zu enges Muster hat hier still gar keine Grafik geliefert.
  const parseLayout = (layout) => {
    const t = String(layout || '').toUpperCase().replace(/[\s_-]/g, '');
    const m = /^([RILVBHW])(\d{1,2})$/.exec(t);
    if (!m) return null;
    const zahl = parseInt(m[2], 10);
    if (!(zahl >= 1 && zahl <= 16)) return null;
    const art = { R: 'R', I: 'R', L: 'R', V: 'V', W: 'V', B: 'B', H: 'B' }[m[1]];
    return { kind: art, count: zahl };
  };

  // Aufladung ebenso: "Bi-Turbo", "Biturbo", "Twin Turbo" und "TwinPower
  // Turbo" sind dasselbe. Frueher traf nur die exakte Schreibweise, ein
  // Turbomotor wurde sonst als Sauger gezeichnet.
  const ladeZahl = (aspiration) => {
    const t = String(aspiration || '').toLowerCase().replace(/[\s_-]/g, '');
    if (!t || /saug|natural|nasp/.test(t)) return 0;
    if (/bi|twin|double|dual/.test(t) && /turbo/.test(t)) return 2;
    if (/turbo|kompressor|supercharg|lader/.test(t)) return 1;
    return 0;
  };

  // Isometrische Projektion: x nach rechts, y nach unten, z als Tiefe schräg
  const iso = (x, y, z) => [x + z * 0.5, y - z * 0.28];

  /** Ein Zylinderbank-Deck mit `n` Bohrungen. Positionierung über `transform`. */
  const bank = (n, transform) => {
    const W = 17, D = 26, H = 20;
    const len = n * W;
    const [ax, ay] = iso(0, 0, 0);
    const [bx, by] = iso(len, 0, 0);
    const [cx, cy] = iso(len, 0, D);
    const [dx, dy] = iso(0, 0, D);
    const bores = Array.from({ length: n }, (_, i) => {
      const [px, py] = iso(W * (i + 0.5), 0, D / 2);
      return `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="6" ry="3.4"
        fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="1.6"/>`;
    }).join('');
    return `<g transform="${transform}">
      <path d="M${ax},${ay} L${ax},${ay + H} L${bx},${by + H} L${bx},${by}"
        fill="currentColor" fill-opacity="0.05" stroke="currentColor" stroke-width="2"/>
      <path d="M${bx},${by} L${cx},${cy} L${cx},${cy + H} L${bx},${by + H} Z"
        fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-width="1.6"/>
      <path d="M${ax},${ay} L${bx},${by} L${cx},${cy} L${dx},${dy} Z"
        fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-width="2"/>
      ${bores}
    </g>`;
  };
  const bankWidth = n => n * 17 + 13;   // Decklänge plus Iso-Tiefe

  /** Laderschnecke mit kurzem Ansaugstutzen zum Block. */
  const turbo = (x, y) => `
    <g transform="translate(${x},${y})" stroke="currentColor" stroke-width="1.8" fill="none">
      <path d="M-14,2 L-6,2" stroke-linecap="round" opacity="0.6"/>
      <path d="M0,-9 a9,9 0 1,1 -6.4,2.7 a6,6 0 1,0 4.2,-1.8" fill="currentColor" fill-opacity="0.12"/>
      <circle cx="0" cy="0" r="2.2" fill="currentColor" stroke="none"/>
    </g>`;


  /**
   * Motorschema.
   * @param {string} layout      'R4' | 'R6' | 'V8' | …
   * @param {string} aspiration  'Sauger' | 'Turbo' | 'Bi-Turbo' | 'Kompressor'
   */
  // Kurbelwelle auf fester Hoehe — sie ist in jeder Bauform die Bezugslinie,
  // an der die Baenke haengen.
  const KURBEL = `<line x1="18" y1="96" x2="174" y2="96"
      stroke="currentColor" stroke-width="2" opacity="0.3" stroke-linecap="round"/>
    <circle cx="96" cy="96" r="4" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>`;

  const RAHMEN = (inhalt) =>
    `<svg class="eng-svg" viewBox="0 0 200 112" fill="none" role="img" aria-hidden="true">${inhalt}</svg>`;

  /** Zeichnung fuer den Fall, dass die Bauform unbekannt ist.
      Ein schlichter Block statt eines leeren Kastens: der Nutzer sieht,
      dass hier ein Motor gemeint ist, und nicht einen Ladefehler. */
  const neutralerBlock = (chargers) => {
    const [ax, ay] = iso(0, 0, 0), [bx, by] = iso(86, 0, 0);
    const [cx, cy] = iso(86, 0, 26), [dx, dy] = iso(0, 0, 26);
    const H = 30;
    const block = `<g transform="translate(56,62)">
      <path d="M${ax},${ay} L${ax},${ay + H} L${bx},${by + H} L${bx},${by}"
        fill="currentColor" fill-opacity="0.05" stroke="currentColor" stroke-width="2"/>
      <path d="M${bx},${by} L${cx},${cy} L${cx},${cy + H} L${bx},${by + H} Z"
        fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-width="1.6"/>
      <path d="M${ax},${ay} L${bx},${by} L${cx},${cy} L${dx},${dy} Z"
        fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-width="2"/>
    </g>`;
    const lader = Array.from({ length: chargers }, (_, i) => turbo(170, 40 + i * 24)).join('');
    return RAHMEN(block + lader + KURBEL);
  };

  const engineSvg = (layout, aspiration) => {
    const L = parseLayout(layout);
    const chargers = ladeZahl(aspiration);
    // Ohne erkennbare Bauform trotzdem etwas zeigen. Vorher stand hier ein
    // leerer String — die Motorkarte blieb dann ohne Bild, ohne dass
    // irgendwo stand, warum.
    if (!L) return neutralerBlock(chargers);
    const CX = 96, CRANK_Y = 96;
    let banks, blockRight;

    if (L.kind === 'R') {
      const w = bankWidth(L.count);
      const x0 = CX - w / 2;
      banks = bank(L.count, `translate(${x0.toFixed(1)},62)`);
      blockRight = x0 + w;
    } else if (L.kind === 'B') {
      // Boxer: die Baenke liegen flach, links und rechts der Welle. Ohne
      // eigenen Zweig waeren sie vorher als V gezeichnet worden — also
      // schlicht falsch.
      const per = Math.max(1, Math.round(L.count / 2));
      const reach = 12 + bankWidth(per) * 0.98;
      const fit = Math.min(1, 84 / reach);
      const flach = bank(per, `rotate(-84) translate(-14,-24)`);
      const setze = m => `<g transform="translate(${CX},${CRANK_Y}) scale(${(fit * m).toFixed(3)},${fit.toFixed(3)})">${flach}</g>`;
      banks = setze(1) + setze(-1);
      blockRight = CX + reach * fit;
    } else {
      // V: zwei gespiegelte Bänke, die vom Kurbeltrieb nach außen-oben aufgehen.
      // Negativer Winkel, damit das äußere Deckende steigt — sonst kippt das V.
      const per = Math.max(1, Math.round(L.count / 2));
      const reach = 12 + bankWidth(per) * 0.906;          // Ausdehnung bei 25°
      const fit = Math.min(1, 88 / reach);                // große V passend skalieren
      const right = bank(per, `rotate(-25) translate(12,-26)`);
      const place = m => `<g transform="translate(${CX},${CRANK_Y}) scale(${(fit * m).toFixed(3)},${fit.toFixed(3)})">${right}</g>`;
      banks = place(1) + place(-1);
      blockRight = CX + reach * fit;
    }

    const chargerSvg = Array.from({ length: chargers }, (_, i) =>
      turbo(Math.min(blockRight + 26, 186), 40 + i * 24)).join('');

    return RAHMEN(banks + chargerSvg + KURBEL);
  };

  window.D4F_GFX = { vehicleSvg, engineSvg };
})();
