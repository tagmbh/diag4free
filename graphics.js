/* ============================================================
   diag4free — Parametrische Fahrzeug- und Motorgrafik
   Vanilla, kein Build-Schritt. Exportiert window.D4F_GFX.

   Zwei Ebenen, bewusst beide:
   - Fahrzeuge tragen ein freigestelltes Seitenfoto (assets/fahrzeuge/*.webp,
     je wenige Kilobyte). Wer eine Baureihe wählt, soll das Auto sehen, das
     vor ihm steht, und nicht eine Strichzeichnung davon.
   - Darunter liegt weiterhin die gerechnete Silhouette. Sie trägt, solange
     das Bild lädt, wenn es fehlt und wenn der Browser webp nicht kann. Sie
     zeichnet in currentColor, also ohne zweiten Satz Assets für Dark.
   - Motoren bleiben vorerst gezeichnet. Ein generiertes "Foto" eines N54
     wäre ein erfundener Motor; die Zeichnung ergibt sich dagegen aus
     content/engines.json — Zylinderzahl, Anordnung, Aufladung, Ventiltrieb.
   - Im öffentlichen Repo liegen nur eigene Assets, keine fremden
     Schnittbilder, Pressefotos oder 3D-Modelle.

   Warum je Baureihe und nicht je Karosserieform:
   Vorher zeichnete diese Datei fünf Silhouetten — eine pro `body`. In der
   Übersicht standen E28, E46 und F30 dadurch als dieselbe Zeichnung
   untereinander. Das ist schlechter als gar keine Grafik, weil es
   Unterscheidbarkeit vortäuscht, wo keine ist. Zwischen 1981 und 2019
   liegen Fußgängerschutz, Crashnormen und ein völlig anderes Verhältnis
   von Glas zu Blech — genau das trägt die Tabelle unten.
   ============================================================ */

(() => {
  'use strict';

  const BODEN = 72;     // Standlinie

  // -------- Fahrzeug-Silhouetten je Baureihe --------
  // Alle Werte im Koordinatensystem der viewBox (200 × 78), Front links.
  // Sie sind nicht frei gezeichnet, sondern aus Länge, Radstand, Überhängen,
  // Höhe und Reifendurchmesser der Baureihe umgerechnet: die gezeichnete
  // Länge steht im Verhältnis zur echten, deshalb ist ein E87 kürzer als ein
  // E38 und ein X5 höher als beide. Was aus der Epoche kommt, sind die
  // Verhältnisse dazwischen — Fensterhöhe, Haubenhöhe, Scheibenneigung,
  // Nierenhöhe.
  //
  //   x0/xt  Stoßfänger unten / Oberkante der Frontmaske. xt < x0 heißt
  //          vorgeneigte Nase (Haifischnase der 80er), xt > x0 die hohe,
  //          senkrechte Front der F-Serie.
  //   ny     Oberkante der Frontmaske, hx/hy Knick der Motorhaube.
  //   cx/cy  Fuß der Windschutzscheibe. cy ist zugleich die Gürtellinie:
  //          cy − ry ist die Fensterhöhe, also das sichtbare Verhältnis von
  //          Glas zu Blech. Es fällt von 0.285 der Fahrzeughöhe beim E28 auf
  //          0.215 beim F30 — genau das sieht man einem Auto an.
  //   ax/px  Dachvorderkante / Dachhinterkante auf Dachhöhe ry.
  //   gx     Fuß der C-Säule auf der Gürtellinie — dort sitzt der
  //          Hofmeister-Knick.
  //   dx/dy  Kofferraumdeckel bzw. Oberkante der Heckklappe, x1/ty Heckabschluss.
  //   fw/rw/wr/sy  Radmitten, Radradius, Schwellerlinie.
  //   dr = Zahl der Türfugen, st = Stoffverdeck.
  //   kid    Höhe der angedeuteten Niere. Sie wächst über die Jahrzehnte von
  //          rund 7 auf 18 Prozent der Fahrzeughöhe und ist BMWs stärkstes
  //          Erkennungszeichen; hier einheitlich um den Faktor 1.4 überzeichnet,
  //          damit sie auf einer 60 px hohen Karte noch trägt.
  const SERIEN = {
    e30        : { x0:24.2, xt:20.2, ny:43.2, hx:42.5, hy:41.7, cx:63.3, cy:39.2, ax:79.3, ry:26.1, px:124.8, gx:139.2, dx:148, dy:35.1, x1:179.8, ty:38, fw:49, rw:143.8, wr:11.4, sy:60.1, kid:4.8, dr:2, st:0 },
    e28        : { x0:20.7, xt:14.7, ny:42.5, hx:38.6, hy:41, cx:60.8, cy:38.4, ax:77.9, ry:25, px:126.5, gx:141.9, dx:151.3, dy:34.2, x1:185.3, ty:37.2, fw:44.3, rw:141.2, wr:11.8, sy:59.7, kid:4.9, dr:2, st:0 },
    e34        : { x0:16.9, xt:12.9, ny:42.5, hx:37.3, hy:41, cx:59.9, cy:38.5, ax:77.3, ry:25.1, px:127, gx:142.7, dx:152.3, dy:34.3, x1:187.1, ty:37.3, fw:42.8, rw:144.7, wr:11.8, sy:59.7, kid:4.9, dr:2, st:0 },
    e36        : { x0:20.2, xt:18.2, ny:41.6, hx:41.1, hy:40.1, cx:64.8, cy:37.7, ax:86.9, ry:25.7, px:130.3, gx:144.2, dx:153.2, dy:34.2, x1:181.8, ty:36.5, fw:47.3, rw:147, wr:11.5, sy:60, kid:6.5, dr:2, st:0 },
    e39        : { x0:13.9, xt:11.9, ny:40.6, hx:36.5, hy:39.1, cx:62.1, cy:36.7, ax:85.9, ry:24.3, px:132.6, gx:147.6, dx:157.3, dy:33.1, x1:188.1, ty:35.5, fw:43.2, rw:147.7, wr:11.9, sy:59.6, kid:6.7, dr:2, st:0 },
    e38        : { x0:10, xt:8, ny:40.6, hx:33.8, hy:39.1, cx:60.4, cy:36.7, ax:85.2, ry:24.3, px:134, gx:149.6, dx:159.7, dy:33.1, x1:192, ty:35.5, fw:40.5, rw:148.7, wr:12.1, sy:59.4, kid:6.7, dr:2, st:0 },
    e46        : { x0:19, xt:17.5, ny:41.1, hx:40.6, hy:39.6, cx:64.5, cy:37.2, ax:86.8, ry:25, px:130.5, gx:144.5, dx:153.6, dy:33.7, x1:182.5, ty:36, fw:47, rw:147.6, wr:11.6, sy:59.9, kid:6.6, dr:2, st:0 },
    e60        : { x0:11.6, xt:10.6, ny:38.6, hx:35.7, hy:37.1, cx:64.3, cy:34.7, ax:91.1, ry:23.2, px:135.8, gx:150.1, dx:159.9, dy:32.3, x1:189.4, ty:33.4, fw:42.4, rw:149, wr:12.2, sy:59.3, kid:9.2, dr:2, st:0 },
    e90        : { x0:17.6, xt:16.6, ny:39.7, hx:39.9, hy:38.2, cx:66.6, cy:35.9, ax:91.6, ry:24.8, px:133.3, gx:146.6, dx:155.8, dy:33.5, x1:183.4, ty:34.7, fw:46.8, rw:148.7, wr:11.8, sy:59.7, kid:8.9, dr:2, st:0 },
    e70        : { x0:12.4, xt:10.4, ny:32.4, hx:35.5, hy:30.9, cx:62.4, cy:29.2, ax:85.7, ry:13.3, px:146, gx:156.8, dx:177.1, dy:16.2, x1:189.6, ty:27.4, fw:42.5, rw:150.8, wr:13.5, sy:58, kid:13.1, dr:2, st:0 },
    e87        : { x0:23.5, xt:22, ny:39.5, hx:43.8, hy:38, cx:68.8, cy:35.7, ax:92.2, ry:24.5, px:132, gx:144.5, dx:167.1, dy:26.9, x1:178, ty:34.3, fw:51.1, rw:149.3, wr:11.6, sy:59.9, kid:9, dr:2, st:0 },
    e88        : { x0:21, xt:19.5, ny:40, hx:42.1, hy:38.5, cx:67.8, cy:36.1, ax:91.9, ry:25.1, px:120.1, gx:133, dx:141.9, dy:33.8, x1:180.5, ty:34.9, fw:48.7, rw:146.9, wr:11.7, sy:59.8, kid:8.9, dr:1, st:1 },
    f10        : { x0:9.6, xt:11.6, ny:36.8, hx:34.9, hy:35.3, cx:68.3, cy:33.8, ax:96.3, ry:23.4, px:139.7, gx:153.3, dx:163.2, dy:31.9, x1:190.4, ty:32.5, fw:42.1, rw:151.6, wr:12.3, sy:59.2, kid:11.9, dr:2, st:0 },
    f30        : { x0:14.6, xt:16.6, ny:37.7, hx:38.5, hy:36.2, cx:70.1, cy:34.7, ax:96.6, ry:24.5, px:137.6, gx:150.4, dx:159.8, dy:32.8, x1:185.4, ty:33.5, fw:46.2, rw:150, wr:12, sy:59.5, kid:11.6, dr:2, st:0 },
    f15        : { x0:9.8, xt:11.8, ny:30.8, hx:35.1, hy:29.3, cx:63.9, cy:27.8, ax:89.2, ry:13.5, px:150.8, gx:160.7, dx:177.6, dy:16.4, x1:190.2, ty:26, fw:42.7, rw:150.9, wr:13.6, sy:57.9, kid:15.6, dr:2, st:0 },
    f22        : { x0:18.2, xt:20.2, ny:37.9, hx:41.1, hy:36.4, cx:71.4, cy:35, ax:96.8, ry:24.9, px:127.4, gx:139.7, dx:148.7, dy:33.1, x1:181.8, ty:33.8, fw:49.2, rw:148.5, wr:11.8, sy:59.7, kid:11.5, dr:1, st:0 }
  };


  // Rückfall je Karosserieform. Greift, wenn `seriesId` fehlt oder unbekannt
  // ist — vehicleSvg(body, era) muss ohne dritten Parameter weiter tragen.
  // Bewusst gemittelte Werte: eine Form ohne Baujahr kann nur generisch sein.
  const FORMEN = {
Limousine  : { x0:16.1, xt:15.1, ny:40.8, hx:38.9, hy:39.3, cx:63.5, cy:37, ax:86.4, ry:24.7, px:131.4, gx:145.8, dx:155.1, dy:33.4, x1:184.9, ty:35.8, fw:45.7, rw:147.6, wr:11.8, sy:59.7, kid:6.6, dr:2, st:0 },
    Coupe      : { x0:16.9, xt:16.9, ny:40.2, hx:40.2, hy:38.7, cx:66.8, cy:36.4, ax:91.7, ry:25.5, px:124.1, gx:137.4, dx:146.5, dy:34.1, x1:183.1, ty:35.2, fw:47.9, rw:148.7, wr:11.8, sy:59.7, kid:8.8, dr:1, st:0 },
    Cabrio     : { x0:17.9, xt:17.9, ny:40.5, hx:40.9, hy:39, cx:67.1, cy:36.7, ax:91.7, ry:25.8, px:120.5, gx:133.6, dx:142.6, dy:34.4, x1:182.1, ty:35.5, fw:48.1, rw:147.1, wr:11.7, sy:59.8, kid:8.7, dr:1, st:1 },
    Schraegheck: { x0:22.5, xt:21.5, ny:39.3, hx:43.5, hy:37.8, cx:68.6, cy:35.4, ax:92.1, ry:24.2, px:132.1, gx:144.7, dx:167.5, dy:26.6, x1:178.5, ty:34, fw:51.1, rw:148.9, wr:11.6, sy:59.9, kid:9, dr:2, st:0 },
    SUV        : { x0:11.4, xt:11.4, ny:33, hx:36.2, hy:31.5, cx:62.8, cy:29.8, ax:85.8, ry:14.2, px:145.4, gx:156, dx:176.2, dy:17.1, x1:188.6, ty:28.1, fw:43.9, rw:150.2, wr:13.5, sy:58, kid:13, dr:2, st:0 }
  };


  const nz = v => (Math.round(v * 10) / 10);

  /**
   * Seitenansicht einer Baureihe.
   * @param {string} body      Karosserieform aus models.json (`body`)
   * @param {string} era       'classic' | 'modern' — steuert die Kantenführung
   * @param {string} seriesId  Baureihen-ID aus models.json (`id`), optional.
   *                           Fehlt sie, greift die generische Form.
   */
  const vehicleSvg = (body, era = 'modern', seriesId = '') => {
    const p = SERIEN[String(seriesId || '').toLowerCase()] || FORMEN[body] || FORMEN.Limousine;
    const join = era === 'classic' ? 'miter' : 'round';

    // Aufriss: Front → Haube → Scheibe → Dach → Heck → Schweller
    const karosse = `M${p.x0},${p.sy} L${p.xt},${p.ny} L${p.hx},${p.hy} L${p.cx},${p.cy}`
      + ` L${p.ax},${p.ry} L${p.px},${p.ry} L${p.dx},${p.dy} L${p.x1},${p.ty} L${p.x1},${p.sy} Z`;

    // Glasfläche. Der letzte Zug vor dem Schließen ist der Hofmeister-Knick:
    // die Hinterkante der C-Säule fällt nach hinten ab und springt an ihrem
    // Fuß wieder nach vorn. Das Merkmal trägt jede BMW-Baureihe hier.
    const fh = p.cy - p.ry;                     // Fensterhöhe
    const rand = nz(Math.min(3, fh * 0.22));    // Dachrand über der Scheibe
    const knick = 4;
    const glas = `M${nz(p.cx + 3)},${p.cy} L${nz(p.ax + 3.5)},${nz(p.ry + rand)}`
      + ` L${nz(p.px - 3.5)},${nz(p.ry + rand)} L${nz(p.gx + knick)},${nz(p.cy - fh * 0.45)}`
      + ` L${p.gx},${p.cy} Z`;

    // B-Säule nur, wo es eine gibt. Coupé und Cabrio bekommen keine.
    const bSaeule = p.dr > 1
      ? `<line x1="${nz(p.cx + (p.gx - p.cx) * 0.47)}" y1="${nz(p.ry + rand + 1)}" x2="${nz(p.cx + (p.gx - p.cx) * 0.47)}" y2="${p.cy}" stroke-width="1.6" opacity="0.45"/>`
      : '';

    // Türfugen: zwei bei viertürigen Karosserien, eine bei Coupé und Cabrio
    const spann = p.rw - p.fw;
    const fugen = (p.dr > 1 ? [0.28, 0.62] : [0.5]).map(t =>
      `<line x1="${nz(p.fw + spann * t)}" y1="${nz(p.cy + 1)}" x2="${nz(p.fw + spann * t)}" y2="${p.sy - 1}" stroke-width="1.4" opacity="0.3"/>`).join('');

    // Radläufe über den Reifen — ohne sie schwebt das Rad neben dem Blech
    const lauf = (cx, r) => `<path d="M${nz(cx - r - 2.5)},${p.sy} A${nz(r + 2.5)},${nz(r + 2.5)} 0 0,1 ${nz(cx + r + 2.5)},${p.sy}" fill="none" stroke-width="1.8" opacity="0.55"/>`;

    const raeder = [p.fw, p.rw].map(cx => `
      <circle cx="${cx}" cy="${p.sy}" r="${p.wr}" fill="none" stroke="currentColor" stroke-width="2.5"/>
      <circle cx="${cx}" cy="${p.sy}" r="${nz(p.wr * 0.35)}" fill="currentColor" opacity="0.5"/>`).join('');

    // Niere: in der reinen Seitenansicht kaum sichtbar, im Frontbereich der
    // Silhouette aber andeutbar. Ihre Höhe ist der Zeitstempel der Zeichnung.
    const neig = (p.x0 - p.xt) / (p.sy - p.ny);
    const nx1 = nz(p.xt + neig * 2), nx2 = nz(p.xt + neig * (2 + p.kid));
    const niere = `<line x1="${nx1}" y1="${nz(p.ny + 2)}" x2="${nx2}" y2="${nz(p.ny + 2 + p.kid)}" stroke-width="2.8" opacity="0.75" stroke-linecap="round"/>`;

    // Scheinwerfer zwischen Niere und Haubenknick
    const lx = nz(p.xt + (p.hx - p.xt) * 0.45), ly = nz((p.ny + p.hy) / 2 + 2);
    const licht = `<ellipse cx="${lx}" cy="${ly}" rx="4.5" ry="2.2" fill="currentColor" opacity="0.28" stroke="none"/>`;

    // Sicke auf der Flanke
    const sicke = `<line x1="${nz(p.hx + 6)}" y1="${nz(p.cy + 8)}" x2="${nz(p.x1 - 8)}" y2="${nz(p.cy + 7)}" stroke-width="1.2" opacity="0.25"/>`;

    // Stoffverdeck: die Naht über der B-Säulen-Position statt einer Dachkante
    const verdeck = p.st
      ? `<line x1="${nz(p.ax + 6)}" y1="${nz(p.ry + 1.5)}" x2="${nz(p.px - 4)}" y2="${nz(p.ry + 1.5)}" stroke-width="1.4" opacity="0.4"/>`
      : '';

    return `<svg class="veh-svg" viewBox="0 0 200 78" fill="none" role="img" aria-hidden="true"
      stroke="currentColor" stroke-width="2.5" stroke-linejoin="${join}" stroke-linecap="round">
      <path d="${karosse}" fill="currentColor" fill-opacity="0.07"/>
      <path d="${glas}" fill="currentColor" fill-opacity="0.13" stroke="currentColor" stroke-width="1.8"/>
      ${bSaeule}${verdeck}${sicke}${fugen}
      ${lauf(p.fw, p.wr)}${lauf(p.rw, p.wr)}
      ${raeder}
      ${niere}${licht}
      <line x1="4" y1="${BODEN}" x2="196" y2="${BODEN}" stroke-width="1.5" opacity="0.25"/>
    </svg>`;
  };

  // -------- Motor-Schemata (isometrisch) --------
  // Aus `layout` (R4/R6/V8…), `aspiration` (Sauger/Turbo/…) und den in
  // content/engines.json belegten Merkmalen gezeichnet. Wer hinschaut, zählt
  // die Bohrungen, sieht die Anordnung und findet die Teile wieder, die den
  // Motor im Motorraum von seinem Nachbarn trennen.

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

  /* Merkmalstabelle. Jede Zeile ist aus content/engines.json belegt — aus
     `valvetrain` oder aus einer Aussage in `id_marks`. Was dort nicht steht,
     steht hier nicht und wird nicht gezeichnet. Beispiele für Lücken, die
     bewusst leer bleiben: der B58 ist ein Direkteinspritzer, engines.json
     sagt es aber nirgends ausdrücklich — also keine Hochdruckpumpe. Der N63
     bekam mit dem TÜ Valvetronic; im `valvetrain` des N63 steht sie nicht,
     also trägt er hier keinen Stellmotor.

       cam  Zahl der Nockenwellen je Bank (SOHC/DOHC aus `valvetrain`)
       vpc  Ventile je Zylinder (Ventilzahl aus `valvetrain` durch Zylinder)
       ccc  Hubraum je Zylinder aus `displacement_cc` — steuert allein den
            Bohrungsdurchmesser. Bei gleichem Hub wächst die Bohrung mit der
            Wurzel des Hubraums; ein M30 zeigt darum größere Bohrungen als
            ein N13. Mehr sagt der Wert nicht aus und mehr wird daraus nicht
            gezeichnet.
       vanos  Zahl der VANOS-Einheiten am Kopf (VANOS / Doppel-VANOS aus
            `valvetrain`), vplus eine weitere, die erst ab dem TU dazukam —
            die wird gestrichelt gezeichnet, weil sie nicht auf jedem
            Exemplar der Baureihe sitzt.
       vtr  Valvetronic-Stellmotor am Kopf: 1 = ja, 2 = nur ab Ausbaustufe
            (gestrichelt gezeichnet). N43, N53, N54 und S65 haben ihn
            ausdrücklich nicht — das ist dort das teuerste Trennmerkmal.
       di   Direkteinspritzung: Hochdruckpumpe am Kopf und Rail
       itb  Einzeldrosselklappen statt Sammelsaugrohr
       disa Zweistufige Ansaugbrücke mit sichtbarer Unterdruckdose. Belegt
            für M44 (gegen den M42) und M54.
       st   Steuertrieb: 'kette' | 'riemen' an der Stirnseite,
            'kette-hinten' auf der Schwungradseite (N47, N57). Beim B47
            widersprechen sich die Quellen — dort wird nichts gezeichnet.
       bal  Ausgleichswelle
       ts   Twin-Scroll-Lader (ein Gehäuse, zwei Fluten)
       llk  Ladeluftkühler: 'll' = Luft-Luft vorn, 'wl' = Wasser-Luft in der
            Ansaugbrücke — nur für N55 und B58 belegt
       hotv Lader innerhalb des Zylinder-V                                  */
  const MOTOR = {
    B38: { cam:2, vpc:4, ccc:500, vanos:2, vtr:1, bal:1 },
    B47: { cam:2, vpc:4, ccc:499, di:1, bal:1 },
    B48: { cam:2, vpc:4, ccc:500, vanos:2, vtr:1, di:1, bal:1 },
    B57: { cam:2, vpc:4, ccc:499, di:1 },
    B58: { cam:2, vpc:4, ccc:500, vanos:2, vtr:1, llk:"wl" },
    M20: { cam:1, vpc:2, ccc:416, st:"riemen" },
    M30: { cam:1, vpc:2, ccc:572, st:"kette" },
    M40: { cam:1, vpc:2, ccc:449, st:"riemen" },
    M42: { cam:2, vpc:4, ccc:449, st:"kette" },
    M43: { cam:1, vpc:2, ccc:474, st:"kette" },
    M44: { cam:2, vpc:4, ccc:474, disa:1, st:"kette" },
    M50: { cam:2, vpc:4, ccc:416, vplus:1, st:"kette" },
    M52: { cam:2, vpc:4, ccc:466, vanos:1, vplus:1, st:"kette" },
    M54: { cam:2, vpc:4, ccc:497, vanos:2, disa:1, st:"kette" },
    M56: { cam:2, vpc:4, ccc:416, vanos:2, st:"kette" },
    M57: { cam:2, vpc:4, ccc:499, di:1, st:"kette" },
    M60: { cam:2, vpc:4, ccc:498, st:"kette" },
    M62: { cam:2, vpc:4, ccc:550, vplus:1, st:"kette" },
    M73: { cam:1, vpc:2, ccc:448, st:"kette" },
    N13: { cam:2, vpc:4, ccc:400, vanos:2, vtr:1, di:1, ts:1 },
    N20: { cam:2, vpc:4, ccc:499, vanos:2, vtr:1, di:1, ts:1 },
    N26: { cam:2, vpc:4, ccc:499, vanos:2, vtr:1 },
    N42: { cam:2, vpc:4, ccc:499, vanos:2, vtr:1 },
    N43: { cam:2, vpc:4, ccc:499, vanos:2, di:1 },
    N45: { cam:2, vpc:4, ccc:399, vanos:2 },
    N46: { cam:2, vpc:4, ccc:499, vanos:2, vtr:1, bal:1 },
    N47: { cam:2, vpc:4, ccc:499, di:1, st:"kette-hinten" },
    N52: { cam:2, vpc:4, ccc:499, vanos:2, vtr:1 },
    N53: { cam:2, vpc:4, ccc:499, vanos:2, di:1 },
    N54: { cam:2, vpc:4, ccc:497, vanos:2, di:1 },
    N55: { cam:2, vpc:4, ccc:497, vanos:2, vtr:1, di:1, ts:1, llk:"ll" },
    N57: { cam:2, vpc:4, ccc:499, di:1, st:"kette-hinten" },
    N62: { cam:2, vpc:4, ccc:550, vanos:2, vtr:1 },
    N63: { cam:2, vpc:4, ccc:549, vanos:2, hotv:1 },
    S14: { cam:2, vpc:4, ccc:576, itb:1, st:"kette" },
    S38: { cam:2, vpc:4, ccc:589, itb:1, st:"kette" },
    S50: { cam:2, vpc:4, ccc:498, vanos:1, itb:1 },
    S52: { cam:2, vpc:4, ccc:525, vanos:1 },
    S54: { cam:2, vpc:4, ccc:541, vanos:2, itb:1 },
    S62: { cam:2, vpc:4, ccc:618, vanos:2, itb:1 },
    S63: { cam:2, vpc:4, ccc:549, vanos:2, vtr:2, di:1, hotv:1 },
    S65: { cam:2, vpc:4, ccc:500, vanos:2, itb:1 },
    S85: { cam:2, vpc:4, ccc:500, vanos:2, itb:1 }
  };


  // Isometrische Projektion: x nach rechts, y nach unten, z als Tiefe schräg
  const iso = (x, y, z) => [x + z * 0.5, y - z * 0.28];
  const f1 = v => v.toFixed(1);

  const strich = (a, b, w, op, extra = '') =>
    `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}"
      stroke="currentColor" stroke-width="${w}" opacity="${op}" stroke-linecap="round"${extra}/>`;

  const BANK_W = 17, BANK_D = 26, BANK_H = 20;

  /** Ein Zylinderbank-Deck mit `n` Bohrungen samt der belegten Kopfteile.
      Alles liegt im Bank-Koordinatensystem, damit V und Boxer die Merkmale
      über dieselbe Transformation mitnehmen. */
  const bank = (n, transform, f = {}) => {
    const W = BANK_W, D = BANK_D, H = BANK_H;
    const len = n * W;
    const [ax, ay] = iso(0, 0, 0);
    const [bx, by] = iso(len, 0, 0);
    const [cx, cy] = iso(len, 0, D);
    const [dx, dy] = iso(0, 0, D);

    // Bohrungen mit Ventilen. Die Ventilzahl je Zylinder steht in
    // engines.json (8V/12V/16V/24V/32V/40V geteilt durch die Zylinderzahl)
    // — ein M43 mit zwei Ventilen sieht damit anders aus als ein M44.
    const vpc = f.vpc === 2 ? 2 : (f.vpc === 4 ? 4 : 0);
    // Bohrungsdurchmesser aus dem Hubraum je Zylinder. Ohne Angabe bleibt es
    // beim bisherigen Mittelmaß.
    const rx = f.ccc ? Math.min(7, Math.max(4.9, 6 * Math.sqrt(f.ccc / 500))) : 6;
    const ry = rx * 0.567;
    const vOff = rx * 0.48;
    const bores = Array.from({ length: n }, (_, i) => {
      const [px, py] = iso(W * (i + 0.5), 0, D / 2);
      const ventile = vpc === 0 ? '' : (vpc === 2 ? [[-vOff, 0], [vOff, 0]] : [[-vOff, -1.4], [vOff, -1.4], [-vOff, 1.4], [vOff, 1.4]])
        .map(([ox, oy]) => `<circle cx="${f1(px + ox)}" cy="${f1(py + oy)}" r="0.9" fill="currentColor" opacity="0.55"/>`).join('');
      return `<ellipse cx="${f1(px)}" cy="${f1(py)}" rx="${f1(rx)}" ry="${f1(ry)}"
        fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="1.6"/>${ventile}`;
    }).join('');

    // Nockenwellen über dem Deck: eine bei SOHC, zwei bei DOHC. Der Ring am
    // vorderen Ende ist das Nockenwellenrad — das ist der Unterschied, den
    // engines.json zwischen M20 und M50 ausdrücklich beschreibt.
    const camY = -6;
    const nocke = (z) => {
      const a = iso(2, camY, z), b = iso(len - 2, camY, z);
      return strich(a, b, 2.4, 0.45)
        + `<circle cx="${f1(a[0])}" cy="${f1(a[1])}" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55"/>`;
    };
    const nocken = f.cam === 1 ? nocke(13) : (f.cam === 2 ? nocke(5) + nocke(21) : '');

    // VANOS-Verstelleinheiten sitzen stirnseitig vor den Nockenwellenrädern.
    // Ihre Zahl trennt Motoren, die sonst gleich aussehen: M50 gegen M54,
    // S50 gegen S54. Gestrichelt heißt: erst ab der überarbeiteten Fassung.
    const pod = (z, gestrichelt) => {
      const [vx, vy] = iso(-3, -6, z);
      return `<circle cx="${f1(vx)}" cy="${f1(vy)}" r="3.4" fill="currentColor" fill-opacity="0.14"
        stroke="currentColor" stroke-width="1.6" opacity="0.6"${gestrichelt ? ' stroke-dasharray="2.4 2"' : ''}/>`;
    };
    const vanos = (f.vanos >= 1 ? pod(5) : '') + (f.vanos >= 2 ? pod(21) : '')
      + (f.vplus ? pod(f.vanos >= 1 ? 21 : 5, true) : '');

    // Ansaugseite. Einzeldrosselklappen sind das Merkmal, an dem engines.json
    // die M-Motoren von ihren zivilen Brüdern trennt (S50 gegen M50, S54
    // gegen M54, S62 gegen M62). Sonst ein Sammelsaugrohr mit einer Klappe.
    const ansaug = f.itb
      ? Array.from({ length: n }, (_, i) => {
          const a = iso(W * (i + 0.5), 0, 0), b = iso(W * (i + 0.5), 0, -8);
          return strich(a, b, 1.8, 0.5)
            + `<ellipse cx="${f1(b[0])}" cy="${f1(b[1])}" rx="3.4" ry="2" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.4"/>`;
        }).join('')
      : strich(iso(4, 0, -7), iso(len - 4, 0, -7), 6, 0.16)
        + strich(iso(4, 0, -7), iso(len - 4, 0, -7), 1.4, 0.4)
        + `<circle cx="${f1(iso(len + 4, 0, -7)[0])}" cy="${f1(iso(len + 4, 0, -7)[1])}" r="3" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.5"/>`;

    // DISA: die Unterdruckdose der zweistufigen Ansaugbrücke sitzt sichtbar
    // außen an der Brücke. Beim M42 fehlt sie, beim M44 ist sie da — genau
    // daran trennt engines.json die beiden.
    const disa = (f.disa && !f.itb)
      ? (() => { const [dax, day] = iso(len * 0.62, 0, -7), [dbx, dby] = iso(len * 0.62, 0, -13);
          return strich([dax, day], [dbx, dby], 1.6, 0.5)
            + `<circle cx="${f1(dbx)}" cy="${f1(dby)}" r="3.2" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.5" opacity="0.55"/>`; })()
      : '';

    // Valvetronic-Stellmotor: liegt quer auf dem Zylinderkopf. Genau nach ihm
    // sucht man, um N52 von N53, N55 von N54 und N62 von M62 zu trennen.
    const vtr = f.vtr
      ? strich(iso(len * 0.46, -5, D + 4), iso(len * 0.46 + 15, -5, D + 4), 5, 0.5,
          f.vtr === 2 ? ' stroke-dasharray="3 2.4"' : '')
      : '';

    // Direkteinspritzung: Rail über dem Kopf, Hochdruckpumpe am Ende. Beim
    // N43 und N53 sitzt sie laut engines.json direkt am Zylinderkopf.
    const di = f.di
      ? (() => { const [hx2, hy2] = iso(len - 2, -3, D + 4);
          return strich(iso(4, -4, D - 2), iso(len - 6, -4, D - 2), 1.6, 0.5)
            + strich(iso(len - 11, -3, D + 4), [hx2, hy2], 5.5, 0.45)
            + `<circle cx="${f1(hx2)}" cy="${f1(hy2)}" r="3.6" fill="currentColor" fill-opacity="0.18"
                stroke="currentColor" stroke-width="1.6" opacity="0.6"/>`; })()
      : '';

    // Wasser-Luft-Ladeluftkühler in der Ansaugbrücke — nur beim B58 belegt
    const llkWl = f.llk === 'wl'
      ? strich(iso(len * 0.3, 0, -7), iso(len * 0.7, 0, -7), 6.5, 0.4, ' stroke-dasharray="2 2"')
      : '';

    return `<g transform="${transform}">
      <path d="M${ax},${ay} L${ax},${ay + H} L${bx},${by + H} L${bx},${by}"
        fill="currentColor" fill-opacity="0.05" stroke="currentColor" stroke-width="2"/>
      <path d="M${bx},${by} L${cx},${cy} L${cx},${cy + H} L${bx},${by + H} Z"
        fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-width="1.6"/>
      <path d="M${ax},${ay} L${bx},${by} L${cx},${cy} L${dx},${dy} Z"
        fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-width="2"/>
      ${bores}${nocken}${vanos}${ansaug}${disa}${llkWl}${vtr}${di}
    </g>`;
  };
  const bankWidth = n => n * BANK_W + 13;   // Decklänge plus Iso-Tiefe

  /** Laderschnecke mit Ansaugstutzen. `twin` zeichnet die zweite Flut des
      Twin-Scroll-Gehäuses — engines.json nennt sie für N13, N20 und N55. */
  const turbo = (x, y, twin) => `
    <g transform="translate(${f1(x)},${f1(y)})" stroke="currentColor" stroke-width="1.8" fill="none">
      <path d="M-14,2 L-6,2" stroke-linecap="round" opacity="0.6"/>
      ${twin ? '<path d="M-14,-2.5 L-7,-2.5" stroke-linecap="round" opacity="0.6"/>' : ''}
      <path d="M0,-9 a9,9 0 1,1 -6.4,2.7 a6,6 0 1,0 4.2,-1.8" fill="currentColor" fill-opacity="0.12"/>
      <circle cx="0" cy="0" r="2.2" fill="currentColor" stroke="none"/>
    </g>`;

  /** Steuertrieb an der Stirnseite. Zahnriemen und Steuerkette stehen für
      M20/M40 gegen M30/M42/M43 ausdrücklich in engines.json — das ist dort
      das Unterscheidungsmerkmal ohne Werkzeug. */
  const steuertrieb = (x, y, art) => art
    ? `<g transform="translate(${f1(x)},${f1(y)})" fill="none" stroke="currentColor">
        <ellipse cx="0" cy="0" rx="7" ry="11" stroke-width="${art === 'kette' ? 2 : 2.6}"
          opacity="0.45"${art === 'kette' ? ' stroke-dasharray="2.4 2"' : ''}/>
        <circle cx="0" cy="-7" r="2.6" stroke-width="1.5" opacity="0.5"/>
        <circle cx="0" cy="7" r="3.4" stroke-width="1.5" opacity="0.5"/>
      </g>`
    : '';

  // Kurbelwelle auf fester Hoehe — sie ist in jeder Bauform die Bezugslinie,
  // an der die Baenke haengen.
  const KURBEL = `<line x1="18" y1="96" x2="174" y2="96"
      stroke="currentColor" stroke-width="2" opacity="0.3" stroke-linecap="round"/>
    <circle cx="96" cy="96" r="4" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>`;

  // Ausgleichswelle unterhalb der Kurbelwelle. Belegt für B38, B47, B48 und
  // N46; für B57, B58 und N45 ist ausdrücklich keine vorhanden.
  const AUSGLEICH = `<line x1="40" y1="105" x2="152" y2="105"
      stroke="currentColor" stroke-width="1.8" opacity="0.3" stroke-linecap="round"/>
    <circle cx="96" cy="105" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.4"/>`;

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

  /**
   * Motorschema.
   * @param {string} layout      'R4' | 'R6' | 'V8' | …
   * @param {string} aspiration  'Sauger' | 'Turbo' | 'Bi-Turbo' | 'Kompressor'
   * @param {string} engineId    Motor-ID aus engines.json (`id`), optional.
   *                             Fehlt sie, bleibt es beim reinen Grundriss.
   */
  const engineSvg = (layout, aspiration, engineId = '') => {
    const L = parseLayout(layout);
    const chargers = ladeZahl(aspiration);
    const f = MOTOR[String(engineId || '').toUpperCase()] || {};
    // Ohne erkennbare Bauform trotzdem etwas zeigen. Vorher stand hier ein
    // leerer String — die Motorkarte blieb dann ohne Bild, ohne dass
    // irgendwo stand, warum.
    if (!L) return neutralerBlock(chargers);
    const CX = 96, CRANK_Y = 96;
    let banks, blockRight, blockLeft;

    if (L.kind === 'R') {
      const w = bankWidth(L.count);
      const x0 = CX - w / 2;
      banks = bank(L.count, `translate(${f1(x0)},62)`, f);
      blockRight = x0 + w;
      blockLeft = x0;
    } else if (L.kind === 'B') {
      // Boxer: die Baenke liegen flach, links und rechts der Welle. Ohne
      // eigenen Zweig waeren sie vorher als V gezeichnet worden — also
      // schlicht falsch.
      const per = Math.max(1, Math.round(L.count / 2));
      const reach = 12 + bankWidth(per) * 0.98;
      const fit = Math.min(1, 78 / reach);
      const flach = bank(per, `rotate(-84) translate(-14,-24)`, f);
      const setze = m => `<g transform="translate(${CX},${CRANK_Y}) scale(${f1(fit * m)},${f1(fit)})">${flach}</g>`;
      banks = setze(1) + setze(-1);
      blockRight = CX + reach * fit;
      blockLeft = CX - reach * fit;
    } else {
      // V: zwei gespiegelte Bänke, die vom Kurbeltrieb nach außen-oben aufgehen.
      // Negativer Winkel, damit das äußere Deckende steigt — sonst kippt das V.
      const per = Math.max(1, Math.round(L.count / 2));
      const reach = 12 + bankWidth(per) * 0.906;          // Ausdehnung bei 25°
      const fit = Math.min(1, 82 / reach);                // große V passend skalieren
      const right = bank(per, `rotate(-25) translate(12,-26)`, f);
      const place = m => `<g transform="translate(${CX},${CRANK_Y}) scale(${f1(fit * m)},${f1(fit)})">${right}</g>`;
      banks = place(1) + place(-1);
      blockRight = CX + reach * fit;
      blockLeft = CX - reach * fit;
    }

    // Lader. Beim N63 und S63 sitzen sie laut engines.json innerhalb des
    // Zylinder-V ("Hot-V") und nicht außen — das ist dort das Merkmal, an
    // dem man den Motorraum ohne Demontage liest.
    const chargerSvg = f.hotv && L.kind === 'V'
      ? Array.from({ length: Math.max(1, chargers) }, (_, i) => turbo(CX + 6, 50 + i * 20, f.ts)).join('')
      : Array.from({ length: chargers }, (_, i) =>
          turbo(Math.min(blockRight + 24, 184), 34 + i * 24, f.ts)).join('');

    // Luft-Luft-Ladeluftkühler vorn im Fahrzeug — nur für den N55 belegt
    const llkLl = f.llk === 'll'
      ? `<g stroke="currentColor" fill="none" opacity="0.45">
          <rect x="10" y="26" width="20" height="14" rx="2" stroke-width="1.6"/>
          <line x1="16" y1="27.5" x2="16" y2="38.5" stroke-width="1.2"/>
          <line x1="20" y1="27.5" x2="20" y2="38.5" stroke-width="1.2"/>
          <line x1="24" y1="27.5" x2="24" y2="38.5" stroke-width="1.2"/>
          <path d="M30,33 L${f1(Math.min(blockRight + 10, 170))},33" stroke-width="1.6" stroke-linecap="round"/>
        </g>`
      : '';

    // Steuertrieb. M57 trägt die Kette vorn und zugänglich, N47 und N57
    // hinten auf der Schwungradseite — engines.json nennt das ausdrücklich
    // als das, was über den Getriebeausbau entscheidet.
    const trieb = f.st === 'kette-hinten'
      ? steuertrieb(Math.min(187, blockRight + 9), 80, 'kette')
      : steuertrieb(Math.max(13, blockLeft - 9), 80, f.st);

    return RAHMEN(banks + chargerSvg + llkLl + trieb + KURBEL + (f.bal ? AUSGLEICH : ''));
  };

  // -------- Legende zum Motorschema --------
  // Das Schema zeigt seit je Nockenwellen, VANOS-Toepfe, DISA-Klappe,
  // Lader und Steuertrieb — aber es sagt nicht, was man da sieht. Fuer den
  // Profi reicht das Bild, fuer den Einsteiger ist es eine Wand.
  //
  // Diese Funktion leitet die Legende aus *denselben* Merkmalen ab, aus
  // denen gezeichnet wird: `MOTOR[id]`, `parseLayout` und `ladeZahl`. Sie
  // kann deshalb nicht behaupten, was nicht im Bild steht, und sie kann
  // nichts verschweigen, was drin ist. Eine zweite, handgepflegte Liste
  // waere genau die Sorte Doppelpflege, die still auseinanderlaeuft.
  //
  // `was` ist bewusst Alltagssprache und sagt, warum das Teil *jetzt*
  // interessiert — nicht, wie es funktioniert. Wer die Abkuerzung nachlesen
  // will, findet sie im Glossar; app.js schickt den Text durch
  // Glossar.markup().
  const ART_NAME = { R: 'Reihenmotor', V: 'V-Motor', B: 'Boxermotor' };

  /**
   * Was auf dem Motorschema zu sehen ist, als Liste.
   * @param   {string} layout      wie bei engineSvg
   * @param   {string} aspiration  wie bei engineSvg
   * @param   {string} engineId    Motor-ID aus engines.json
   * @returns {Array<{teil: string, was: string}>} leer, wenn nichts belegt ist
   */
  const engineTeile = (layout, aspiration, engineId = '') => {
    const L = parseLayout(layout);
    const chargers = ladeZahl(aspiration);
    const f = MOTOR[String(engineId || '').toUpperCase()] || {};
    const teile = [];
    const dazu = (teil, was) => teile.push({ teil, was });

    if (L) {
      dazu(`${ART_NAME[L.kind]}, ${L.count} Zylinder`,
        L.kind === 'R'
          ? 'Alle Zylinder in einer Reihe. Im Schema die eine lange Bank.'
          : L.kind === 'V'
            ? 'Zwei Zylinderbaenke im Winkel. Vieles gibt es dadurch doppelt — zwei Nockenwellensaetze, zwei Abgaskruemmer, oft zwei Lambdasonden je Seite.'
            : 'Zwei Baenke, flach gegenueber. Im Schema die beiden waagerechten Bloecke links und rechts der Kurbelwelle.');
    }
    if (f.vpc) {
      dazu(`${f.vpc} Ventile je Zylinder`,
        f.vpc === 4
          ? 'Die vier Punkte in jeder Bohrung. Zwei Einlass, zwei Auslass.'
          : 'Die zwei Punkte in jeder Bohrung. Ein Einlass, ein Auslass.');
    }
    if (f.cam) {
      dazu(f.cam === 2 ? 'Zwei obenliegende Nockenwellen (DOHC)' : 'Eine obenliegende Nockenwelle (SOHC)',
        f.cam === 2
          ? 'Die zwei Laengslinien ueber der Bank. Eine steuert die Einlass-, eine die Auslassventile.'
          : 'Die eine Laengslinie ueber der Bank. Sie steuert Einlass und Auslass zusammen.');
    }
    if (f.vanos) {
      dazu(f.vanos >= 2 ? 'Doppel-VANOS' : 'VANOS',
        f.vanos >= 2
          ? 'Die beiden Toepfe vorn an den Nockenwellen. Sie verstellen die Steuerzeiten auf beiden Seiten — eine haeufige Fehlerquelle bei Leerlauf- und Leistungsklagen.'
          : 'Der Topf vorn an der Einlassnockenwelle. Er verstellt die Steuerzeiten des Einlasses.');
    }
    if (f.vtr) {
      dazu('Valvetronic',
        'Der zusaetzliche Aufbau auf dem Ventildeckel. Der Motor regelt die Last ueber den Ventilhub statt ueber die Drosselklappe.');
    }
    if (f.disa) {
      dazu('DISA',
        'Die Klappe im Ansaugkanal. Sie schaltet die Saugrohrlaenge um; ihre Lagerung ist eine bekannte Schwachstelle.');
    }
    if (f.itb) {
      dazu('Einzeldrosselklappen',
        'Je Zylinder ein eigener Ansaugtrichter mit eigener Klappe — im Schema die einzelnen Stutzen statt eines gemeinsamen Sammlers.');
    }
    if (f.di) {
      dazu('Direkteinspritzung',
        'Der Anschluss an der Bankseite. Der Kraftstoff geht unter hohem Druck direkt in den Brennraum, nicht in den Ansaugkanal.');
    }
    if (chargers) {
      const artName = /kompressor|supercharg/i.test(String(aspiration)) ? 'Kompressor' : (chargers > 1 ? 'Zwei Turbolader' : 'Turbolader');
      dazu(artName + (f.ts ? ' (Twin-Scroll)' : ''),
        f.hotv
          ? 'Die Schnecke *innerhalb* des Zylinder-V. Diese Bauart heisst Hot-V; die Lader sitzen nicht aussen, sondern in der Mitte oben.'
          : f.ts
            ? 'Die Schnecke neben dem Block, mit zwei getrennten Abgaszufuehrungen — daran erkennbar, dass zwei Striche statt einem hineinlaufen.'
            : 'Die Schnecke neben dem Block.');
    }
    if (f.llk === 'll') {
      dazu('Ladeluftkuehler, Luft-Luft',
        'Der Block ganz vorn mit der Leitung zum Motor. Er sitzt vor dem Fahrzeug im Fahrtwind.');
    }
    if (f.llk === 'wl') {
      dazu('Ladeluftkuehler, Wasser-Luft',
        'Kein Kuehler vorn im Fahrtwind: die Ladeluft wird ueber einen eigenen Wasserkreis gekuehlt, direkt am Saugrohr.');
    }
    if (f.st) {
      const hinten = f.st === 'kette-hinten';
      dazu(hinten ? 'Steuerkette, hinten' : (f.st === 'riemen' ? 'Zahnriemen' : 'Steuerkette'),
        hinten
          ? 'Im Schema auf der rechten Seite, also auf der Schwungradseite. Das entscheidet ueber den Aufwand: an die Kette kommt man nur mit ausgebautem Getriebe.'
          : f.st === 'riemen'
            ? 'Links am Block. Ein Riemen ist ein Verschleissteil mit Wechselintervall — anders als eine Kette.'
            : 'Links am Block, auf der Stirnseite und damit zugaenglich.');
    }
    if (f.bal) {
      dazu('Ausgleichswelle',
        'Die zweite Laengslinie unter der Kurbelwelle. Sie nimmt die Vibrationen auf, die diese Zylinderzahl bauartbedingt erzeugt.');
    }
    return teile;
  };

  // `formen` und `baureihen` werden von scripts/audit.mjs gelesen. Vorher
  // hat das Audit die Tabelle per Textmuster aus dieser Datei geholt — das
  // ist an einer Umbenennung zerbrochen, einmal sogar still und mit
  // falschem Ergebnis. Deshalb steht die Liste jetzt im Vertrag: wer hier
  // eine Form ergaenzt, macht sie damit zugleich pruefbar.
  // -------- Foto statt Zeichnung, wo eines vorliegt --------
  // Der Wunsch war ausdruecklich: keine Strichzeichnungen, sondern echte
  // Fahrzeuge. Fuer jede Baureihe in dieser Liste liegt unter
  // assets/fahrzeuge/<id>.webp ein freigestelltes Seitenprofil (260 px
  // breit, wenige Kilobyte). Die Zeichnung bleibt trotzdem im Markup: sie
  // steht darunter und traegt, wenn das Bild fehlt, noch laedt oder der
  // Browser webp nicht kann. Ein Eintrag hier ohne Datei daneben faellt in
  // scripts/audit.mjs auf.
  const MIT_FOTO = [
    'e28', 'e30', 'e34', 'e36', 'e38', 'e39', 'e46', 'e60', 'e70',
    'e87', 'e88', 'e90', 'f10', 'f15', 'f22', 'f30'
  ];

  /**
   * Fahrzeugbild fuer Karten und Kopfzeilen.
   * Liefert das Foto ueber der Zeichnung; ohne Foto genau das, was
   * vehicleSvg() bisher geliefert hat.
   * @param {string} body      Karosserieform aus models.json
   * @param {string} era       'classic' | 'modern'
   * @param {string} seriesId  Baureihen-ID aus models.json
   */
  const vehicleArt = (body, era = 'modern', seriesId = '') => {
    const id = String(seriesId || '').toLowerCase();
    const svg = vehicleSvg(body, era, id);
    if (!MIT_FOTO.includes(id)) return svg;
    // onerror raeumt das Bild weg statt ein kaputtes Symbol stehen zu
    // lassen — darunter liegt die Zeichnung und wird wieder sichtbar.
    // Bewusst kein loading="lazy": alle sechzehn Bilder zusammen sind rund
    // 120 kB und liegen ohnehin im Vorrat des Service Workers. Lazy haette
    // hier nichts gespart, dafuer beim Scrollen durch die Baureihenliste
    // sichtbar nachgeladen — und es macht "Bild da" von "Bild geladen"
    // ununterscheidbar, worueber die Abnahme schon gestolpert ist.
    return `<span class="veh-art">`
      + `<img class="veh-photo" src="assets/fahrzeuge/${id}.webp" alt="" `
      + `width="260" height="99" decoding="async" `
      + `onerror="this.remove()">${svg}</span>`;
  };

  window.D4F_GFX = {
    vehicleSvg, vehicleArt, engineSvg, engineTeile,
    formen: Object.keys(FORMEN),
    baureihen: Object.keys(SERIEN),
    fotos: MIT_FOTO.slice()
  };
})();
