/* ============================================================
   diag4free — OBD-Layer
   Eigene Diagnose statt Verweis auf fremde Werkzeuge.

   Zwei Transporte, beide reine Browser-APIs, kein Server:
     - Web Serial   → ELM327 am USB (auch K+DCAN-Kabel mit ELM-Firmware)
     - Web Bluetooth → ELM327 als BLE-Dongle

   Was der Layer kann, ist die genormte OBD-II-Ebene (SAE J1979):
   Antriebsstrang-Fehlercodes, Live-Werte, Readiness, Fahrzeug-VIN.
   Was er NICHT kann, ist BMW-Hausdiagnose — Komfort- und
   Karosseriesteuergeräte sprechen proprietär und bleiben INPA/ISTA
   vorbehalten. Diese Grenze wird in der Oberfläche benannt, nicht
   verschwiegen.
   ============================================================ */

window.OBD = (() => {
  'use strict';

  const PROMPT = '>';
  const CR = '\r';

  // -------- Was der Browser hergibt --------
  // Beide APIs verlangen einen sicheren Kontext und eine Nutzergeste.
  // iOS/Safari hat keines von beidem — das ist eine Tatsache, kein Fehler,
  // und die Oberfläche muss es sagen statt einen Verbindungsversuch
  // ins Leere laufen zu lassen.
  const support = () => ({
    secure:    window.isSecureContext === true,
    serial:    typeof navigator !== 'undefined' && 'serial' in navigator,
    bluetooth: typeof navigator !== 'undefined' && 'bluetooth' in navigator
  });

  const supported = () => {
    const s = support();
    return s.secure && (s.serial || s.bluetooth);
  };

  // ============================================================
  // FEHLERCODES
  // Zwei Bytes je Code. Die oberen zwei Bit wählen die Gruppe,
  // die nächsten zwei die erste Ziffer, die restlichen drei Nibbles
  // sind hexadezimal. 0x0133 wird so zu P0133.
  // ============================================================
  const GRUPPEN = ['P', 'C', 'B', 'U'];

  const decodeDtc = (hi, lo) => {
    const gruppe = GRUPPEN[(hi >> 6) & 0x03];
    const ziffer1 = (hi >> 4) & 0x03;
    const rest = ((hi & 0x0f) << 8) | lo;
    return gruppe + ziffer1 + rest.toString(16).toUpperCase().padStart(3, '0');
  };

  // Herkunft eines Codes — hilft beim Einordnen, bevor irgendein
  // Klartext vorliegt.
  const dtcHerkunft = (code) => {
    const g = code[0];
    const z = code[1];
    if (g === 'P') return z === '0' ? 'Antrieb · genormt' : 'Antrieb · herstellerspezifisch';
    if (g === 'C') return z === '0' ? 'Fahrwerk · genormt' : 'Fahrwerk · herstellerspezifisch';
    if (g === 'B') return z === '0' ? 'Karosserie · genormt' : 'Karosserie · herstellerspezifisch';
    return z === '0' ? 'Netzwerk · genormt' : 'Netzwerk · herstellerspezifisch';
  };

  // ============================================================
  // LIVE-WERTE (Service 01)
  // Formeln nach SAE J1979. `bytes` ist das reine Datenfeld ohne
  // Antwortkopf. Jede Angabe kommt mit Einheit und, wo die Norm
  // einen Bereich vorgibt, mit plausiblen Grenzen für die Anzeige.
  // ============================================================
  const PIDS = {
    '04': { name: 'Berechnete Last',        einheit: '%',   min: 0,    max: 100,  f: (b) => b[0] * 100 / 255 },
    '05': { name: 'Kühlmitteltemperatur',   einheit: '°C',  min: -40,  max: 215,  f: (b) => b[0] - 40 },
    '06': { name: 'Kurzzeit-Gemischkorrektur B1', einheit: '%', min: -100, max: 99, f: (b) => b[0] * 100 / 128 - 100 },
    '07': { name: 'Langzeit-Gemischkorrektur B1', einheit: '%', min: -100, max: 99, f: (b) => b[0] * 100 / 128 - 100 },
    '0A': { name: 'Kraftstoffdruck',        einheit: 'kPa', min: 0,    max: 765,  f: (b) => b[0] * 3 },
    '0B': { name: 'Saugrohrdruck',          einheit: 'kPa', min: 0,    max: 255,  f: (b) => b[0] },
    '0C': { name: 'Drehzahl',               einheit: '1/min', min: 0,  max: 8000, f: (b) => ((b[0] << 8) | b[1]) / 4 },
    '0D': { name: 'Geschwindigkeit',        einheit: 'km/h', min: 0,   max: 255,  f: (b) => b[0] },
    '0E': { name: 'Zündzeitpunkt',          einheit: '°KW', min: -64,  max: 63,   f: (b) => b[0] / 2 - 64 },
    '0F': { name: 'Ansauglufttemperatur',   einheit: '°C',  min: -40,  max: 215,  f: (b) => b[0] - 40 },
    '10': { name: 'Luftmasse',              einheit: 'g/s', min: 0,    max: 655,  f: (b) => ((b[0] << 8) | b[1]) / 100 },
    '11': { name: 'Drosselklappenstellung', einheit: '%',   min: 0,    max: 100,  f: (b) => b[0] * 100 / 255 },
    '1F': { name: 'Laufzeit seit Start',    einheit: 's',   min: 0,    max: 65535, f: (b) => (b[0] << 8) | b[1] },
    '21': { name: 'Strecke mit MIL an',     einheit: 'km',  min: 0,    max: 65535, f: (b) => (b[0] << 8) | b[1] },
    '2F': { name: 'Tankfüllstand',          einheit: '%',   min: 0,    max: 100,  f: (b) => b[0] * 100 / 255 },
    '33': { name: 'Luftdruck absolut',      einheit: 'kPa', min: 0,    max: 255,  f: (b) => b[0] },
    '42': { name: 'Steuergerätspannung',    einheit: 'V',   min: 0,    max: 65,   f: (b) => ((b[0] << 8) | b[1]) / 1000 },
    '46': { name: 'Umgebungstemperatur',    einheit: '°C',  min: -40,  max: 215,  f: (b) => b[0] - 40 },
    '5C': { name: 'Öltemperatur',           einheit: '°C',  min: -40,  max: 210,  f: (b) => b[0] - 40 }
  };

  // ============================================================
  // TRANSPORT
  // Beide Varianten reichen nach oben dieselbe Schnittstelle durch:
  // schreiben, lesen bis zum Prompt, schliessen.
  // ============================================================

  let transport = null;   // { art, schreib(text), aufTrennung(), schliessen() }
  let puffer = '';
  let warteAuflösung = null;

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  // Jede eingehende Sequenz landet im Puffer. Der ELM327 signalisiert
  // das Ende einer Antwort mit '>' — erst dann ist sie vollständig.
  const aufnehmen = (text) => {
    puffer += text;
    if (puffer.includes(PROMPT) && warteAuflösung) {
      const antwort = puffer.slice(0, puffer.indexOf(PROMPT));
      puffer = '';
      const auf = warteAuflösung;
      warteAuflösung = null;
      auf(antwort);
    }
  };

  // -------- Web Serial --------
  const connectSerial = async () => {
    if (!('serial' in navigator)) throw new Error('Web Serial steht in diesem Browser nicht zur Verfügung.');
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 38400 });

    const writer = port.writable.getWriter();
    const reader = port.readable.getReader();
    let laufend = true;

    (async () => {
      try {
        while (laufend) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) aufnehmen(decoder.decode(value, { stream: true }));
        }
      } catch { /* Trennung während des Lesens ist kein Sonderfall */ }
    })();

    transport = {
      art: 'serial',
      name: 'USB-Adapter',
      schreib: (text) => writer.write(encoder.encode(text)),
      schliessen: async () => {
        laufend = false;
        try { await reader.cancel(); } catch {}
        try { reader.releaseLock(); } catch {}
        try { writer.releaseLock(); } catch {}
        try { await port.close(); } catch {}
      }
    };
    return transport;
  };

  // -------- Web Bluetooth --------
  // BLE-ELM327-Klone benutzen keinen einheitlichen Dienst. Die drei
  // verbreiteten UUIDs werden der Reihe nach probiert; welcher passt,
  // entscheidet das Gerät.
  const BLE_DIENSTE = [
    0xfff0,
    0xffe0,
    '6e400001-b5a3-f393-e0a9-e50e24dcca9e'   // Nordic UART, in neueren Dongles
  ];

  const connectBluetooth = async () => {
    if (!('bluetooth' in navigator)) throw new Error('Web Bluetooth steht in diesem Browser nicht zur Verfügung.');
    const gerät = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: BLE_DIENSTE
    });
    const server = await gerät.gatt.connect();

    let dienst = null;
    for (const uuid of BLE_DIENSTE) {
      try { dienst = await server.getPrimaryService(uuid); break; } catch {}
    }
    if (!dienst) throw new Error('Kein bekannter ELM327-Dienst auf diesem Gerät gefunden.');

    const merkmale = await dienst.getCharacteristics();
    const schreibM = merkmale.find(c => c.properties.write || c.properties.writeWithoutResponse);
    const leseM   = merkmale.find(c => c.properties.notify);
    if (!schreibM || !leseM) throw new Error('Das Gerät bietet keine Schreib-/Melde-Kombination.');

    await leseM.startNotifications();
    leseM.addEventListener('characteristicvaluechanged', (e) => {
      aufnehmen(decoder.decode(e.target.value));
    });

    transport = {
      art: 'bluetooth',
      name: gerät.name || 'BLE-Adapter',
      schreib: (text) => {
        const daten = encoder.encode(text);
        return schreibM.properties.writeWithoutResponse
          ? schreibM.writeValueWithoutResponse(daten)
          : schreibM.writeValue(daten);
      },
      schliessen: async () => {
        try { await leseM.stopNotifications(); } catch {}
        try { gerät.gatt.disconnect(); } catch {}
      }
    };
    return transport;
  };

  // ============================================================
  // BEFEHLSEBENE
  // ============================================================

  const verbunden = () => transport !== null;

  // Ein Befehl, eine Antwort. Ohne Zeitgrenze bliebe ein stummer
  // Adapter für immer hängen — deshalb gewinnt hier immer die Uhr.
  const sendeEinzeln = (befehl, msFrist) => new Promise((auf, ab) => {
    if (!transport) return ab(new Error('Nicht verbunden.'));
    puffer = '';
    const uhr = setTimeout(() => {
      warteAuflösung = null;
      ab(new Error(`Keine Antwort auf "${befehl}" innerhalb von ${msFrist} ms.`));
    }, msFrist);
    warteAuflösung = (antwort) => { clearTimeout(uhr); auf(antwort); };
    transport.schreib(befehl + CR).catch((e) => { clearTimeout(uhr); warteAuflösung = null; ab(e); });
  });

  // Der ELM327 kennt nur einen Befehl zur Zeit. Laufen Live-Abfrage und
  // Fehlerspeicher-Lesen gleichzeitig, überschrieb der zweite Befehl
  // vorher den Warteplatz des ersten — beide bekamen dann nichts, ohne
  // Fehlermeldung. Deshalb stehen die Befehle jetzt in einer Reihe.
  let reihe = Promise.resolve();
  const send = (befehl, msFrist = 5000) => {
    const lauf = reihe.then(() => sendeEinzeln(befehl, msFrist));
    reihe = lauf.catch(() => {});
    return lauf;
  };

  // Antwortzeilen säubern. Der Adapter spiegelt je nach Einstellung
  // den Befehl, meldet Suchvorgänge und bricht CAN-Antworten über
  // mehrere Zeilen mit Index-Präfix um.
  const zeilen = (roh) => roh
    .split(/[\r\n]+/)
    .map(z => z.trim())
    .filter(z => z && z !== PROMPT && !/^SEARCHING/i.test(z));

  const FEHLERTEXTE = {
    'UNABLE TO CONNECT': 'Der Adapter erreicht kein Steuergerät. Zündung an?',
    'NO DATA':           'Das Steuergerät antwortet auf diese Anfrage nicht.',
    'CAN ERROR':         'Busfehler. Sitzt der Stecker fest?',
    'BUS INIT':          'Businitialisierung fehlgeschlagen.',
    'STOPPED':           'Abfrage abgebrochen.',
    '?':                 'Der Adapter kennt diesen Befehl nicht.'
  };

  const alsFehler = (text) => {
    const oben = text.toUpperCase();
    for (const [muster, klartext] of Object.entries(FEHLERTEXTE)) {
      if (oben.includes(muster)) return klartext;
    }
    return null;
  };

  // Eine Antwort in Nachrichten zerlegen. Eine Zeile ist eine Nachricht —
  // ausser bei langen CAN-Antworten: die kündigt der Adapter mit einer
  // dreistelligen Längenangabe an und bricht sie dann mit Zeilenindex
  // ("0:", "1:") um; das letzte Stück ist mit Nullen aufgefüllt, die
  // Längenangabe sagt, wo die Nutzdaten enden. Antworten mehrerer
  // Steuergeräte kommen als getrennte Zeilen — und müssen getrennt
  // bleiben: vorher wurden alle Bytes aneinandergehängt, und das "43"
  // des zweiten Steuergeräts wurde als Fehlercode gelesen.
  const nachrichten = (roh) => {
    const fertig = [];
    let offen = null;                                       // { laenge, bytes }
    const abschliessen = () => {
      if (offen) fertig.push(offen.bytes.slice(0, offen.laenge));
      offen = null;
    };
    for (const z of zeilen(roh)) {
      if (/^[0-9A-F]{3}$/i.test(z)) {                        // Längenkopf
        abschliessen();
        offen = { laenge: parseInt(z, 16), bytes: [] };
        continue;
      }
      const idx = /^([0-9A-F]):\s*(.*)$/i.exec(z);
      const teile = (idx ? idx[2] : z).split(/\s+/)
        .filter(t => /^[0-9A-F]{2}$/i.test(t))
        .map(t => parseInt(t, 16));
      if (!teile.length) continue;
      if (idx) {
        if (!offen) offen = { laenge: Infinity, bytes: [] };
        offen.bytes.push(...teile);
        continue;
      }
      abschliessen();
      fertig.push(teile);
    }
    abschliessen();
    return fertig;
  };

  // Alle Datenbytes flach — für Abfragen, bei denen die erste Antwort
  // genügt (Live-Wert, Status, PID-Maske).
  const bytesAus = (roh) => nachrichten(roh).flat();

  // ============================================================
  // ADAPTER VORBEREITEN
  // Echo aus, Zeilenumbrüche aus, Leerzeichen an (erleichtert das
  // Zerlegen), Protokoll automatisch suchen lassen.
  // ============================================================
  // Welches Protokoll der Bus spricht, entscheidet, wie Fehlercodes zu
  // lesen sind: auf CAN steht nach dem Antwortkopf die Anzahl der Codes,
  // auf K-Leitung (ISO 9141, KWP) nicht. 'can' | 'k' | null (unbekannt).
  let protokoll = null;

  const init = async (melde = () => {}) => {
    protokoll = null;
    const schritte = [
      ['ATZ',  'Adapter zurücksetzen',  9000],
      ['ATE0', 'Echo abschalten',       3000],
      ['ATL0', 'Zeilenumbrüche aus',    3000],
      ['ATS1', 'Trennzeichen an',       3000],
      ['ATH0', 'Kopfzeilen aus',        3000],
      ['ATSP0','Protokoll suchen',      5000]
    ];
    for (const [befehl, was, frist] of schritte) {
      melde(was);
      await send(befehl, frist);
    }
    // Das Protokoll steht erst nach der ersten echten Anfrage fest — die
    // Suche läuft beim ersten Befehl an den Bus, nicht bei ATSP0. Danach
    // nennt ATDPN die Nummer: 1–5 sind K-Leitung, 6–9 und A–C sind CAN,
    // ein vorangestelltes "A" heisst nur "automatisch gefunden".
    melde('Protokoll bestimmen');
    try { await send('0100', 12000); } catch { /* ohne Zündung: bleibt unbekannt */ }
    try {
      const m = /([1-9A-C])\s*$/i.exec(await send('ATDPN', 3000));
      protokoll = m ? (/[6-9A-C]/i.test(m[1]) ? 'can' : 'k') : null;
    } catch { protokoll = null; }
    melde('Bereit');
  };

  // ============================================================
  // DIENSTE
  // ============================================================

  // Fehlerspeicher. Drei Töpfe, weil sie Unterschiedliches bedeuten:
  // gespeichert (Service 03), sporadisch/noch nicht bestätigt (07)
  // und dauerhaft, nur vom Steuergerät selbst löschbar (0A).
  const TOEPFE = [
    { dienst: '03', antwort: 0x43, art: 'gespeichert', hinweis: 'Bestätigter Fehler, MIL kann leuchten.' },
    { dienst: '07', antwort: 0x47, art: 'sporadisch',  hinweis: 'Einmal aufgetreten, noch nicht bestätigt.' },
    { dienst: '0A', antwort: 0x4A, art: 'dauerhaft',   hinweis: 'Löscht sich erst nach bestandener Eigenprüfung.' }
  ];

  const readDtcs = async () => {
    const gefunden = [];
    for (const topf of TOEPFE) {
      let roh;
      try { roh = await send(topf.dienst, 8000); } catch { continue; }
      if (alsFehler(roh)) continue;

      // Jede Nachricht für sich: ein Steuergerät, ein Antwortkopf.
      for (const n of nachrichten(roh)) {
        const start = n.indexOf(topf.antwort);
        if (start < 0) continue;
        let i = start + 1;
        // Auf CAN folgt dem Kopf die Anzahl der Codes. Ist das Protokoll
        // unbekannt, verrät es die Länge: eine K-Leitungs-Antwort ist
        // Kopf plus drei Paare, also gerade viele Bytes nach dem Kopf;
        // auf CAN sind es Anzahl plus Paare, also ungerade viele.
        const rest = n.length - i;
        const mitAnzahl = protokoll === 'can' || (protokoll === null && rest % 2 === 1);
        let paare = Infinity;
        if (mitAnzahl) { paare = n[i]; i += 1; }
        for (let k = 0; k < paare && i + 1 < n.length; k++, i += 2) {
          const hi = n[i], lo = n[i + 1];
          if (hi === 0 && lo === 0) continue;             // Füllbytes
          const code = decodeDtc(hi, lo);
          if (gefunden.some(g => g.code === code && g.art === topf.art)) continue;
          gefunden.push({ code, art: topf.art, hinweis: topf.hinweis, herkunft: dtcHerkunft(code) });
        }
      }
    }
    return gefunden;
  };

  // Löschen setzt auch Readiness-Monitore und Freeze-Frame zurück.
  // Die Oberfläche fragt vorher nach — hier wird nur ausgeführt.
  const clearDtcs = async () => {
    const roh = await send('04', 8000);
    const fehler = alsFehler(roh);
    if (fehler) throw new Error(fehler);
    return true;
  };

  // Ein Live-Wert. Gibt null zurück, wenn das Steuergerät den PID
  // nicht kennt — das ist der Normalfall bei älteren Motoren und
  // kein Grund für eine Fehlermeldung.
  const readPid = async (pid) => {
    const eintrag = PIDS[pid];
    if (!eintrag) return null;
    let roh;
    try { roh = await send('01' + pid, 4000); } catch { return null; }
    if (alsFehler(roh)) return null;

    const bytes = bytesAus(roh);
    const start = bytes.indexOf(0x41);
    if (start < 0 || bytes[start + 1] !== parseInt(pid, 16)) return null;
    const daten = bytes.slice(start + 2);
    if (!daten.length) return null;

    const wert = eintrag.f(daten);
    if (!Number.isFinite(wert)) return null;
    return { pid, name: eintrag.name, einheit: eintrag.einheit, wert, min: eintrag.min, max: eintrag.max };
  };

  // Welche PIDs das Fahrzeug überhaupt unterstützt, sagt es selbst:
  // PID 00 liefert eine Bitmaske für 01–20, PID 20 eine für 21–40, PID 40
  // eine für 41–60. Danach zu fragen erspart zwanzig Anfragen ins Leere.
  // Vorher wurden die PIDs oberhalb 20 blind angehängt — jede kostete
  // dann bei jedem Durchlauf eine Anfrage, die mit NO DATA endete.
  const maskeLesen = async (basis) => {
    const pidHex = basis.toString(16).toUpperCase().padStart(2, '0');
    let roh;
    try { roh = await send('01' + pidHex, 4000); } catch { return null; }
    if (alsFehler(roh)) return null;
    const bytes = bytesAus(roh);
    const start = bytes.indexOf(0x41);
    if (start < 0 || bytes[start + 1] !== basis) return null;
    const maske = bytes.slice(start + 2, start + 6);
    return maske.length < 4 ? null : maske;
  };

  const readSupportedPids = async () => {
    const unterstützt = [];
    for (const basis of [0x00, 0x20, 0x40]) {
      const maske = await maskeLesen(basis);
      if (!maske) break;
      for (let bit = 0; bit < 32; bit++) {
        const gesetzt = (maske[Math.floor(bit / 8)] >> (7 - (bit % 8))) & 1;
        if (!gesetzt) continue;
        const pid = (basis + bit + 1).toString(16).toUpperCase().padStart(2, '0');
        if (PIDS[pid]) unterstützt.push(pid);
      }
      // Das letzte Bit jeder Maske sagt, ob es die nächste gibt.
      if (!(maske[3] & 0x01)) break;
    }
    return unterstützt.length ? unterstützt : Object.keys(PIDS);
  };

  // Fortlaufendes Abfragen. Gibt eine Stoppfunktion zurück statt
  // eines Timers — der Aufrufer soll nicht wissen müssen, wie oft
  // hier im Hintergrund gefragt wird.
  const livePoll = (pids, beiWert, msTakt = 500) => {
    let aktiv = true;
    (async () => {
      while (aktiv) {
        for (const pid of pids) {
          if (!aktiv) break;
          const wert = await readPid(pid);
          if (wert && aktiv) beiWert(wert);
        }
        await new Promise(r => setTimeout(r, msTakt));
      }
    })();
    return () => { aktiv = false; };
  };

  // VIN aus Service 09, PID 02. Kommt als ASCII, bei CAN über mehrere
  // Frames mit Füllbytes am Anfang.
  const readVin = async () => {
    let roh;
    try { roh = await send('0902', 6000); } catch { return null; }
    if (alsFehler(roh)) return null;

    // Auf CAN eine lange Nachricht: 49 02, Anzahl, 17 Zeichen. Auf der
    // K-Leitung fünf kurze: 49 02, laufende Nummer, je vier Zeichen, die
    // erste mit Nullen aufgefüllt. In beiden Fällen: Kopf und ein
    // Zählbyte weg, den Rest aneinanderhängen.
    let text = '';
    for (const n of nachrichten(roh)) {
      const start = n.indexOf(0x49);
      if (start < 0 || n[start + 1] !== 0x02) continue;
      text += n.slice(start + 3)
        .filter(b => b >= 0x30 && b <= 0x5a)
        .map(b => String.fromCharCode(b))
        .join('');
    }
    const treffer = text.match(/[A-HJ-NPR-Z0-9]{17}/);
    return treffer ? treffer[0] : null;
  };

  // Fehlerlampe und Anzahl der Codes stehen in Service 01 PID 01.
  const readStatus = async () => {
    let roh;
    try { roh = await send('0101', 4000); } catch { return null; }
    if (alsFehler(roh)) return null;
    const bytes = bytesAus(roh);
    const start = bytes.indexOf(0x41);
    if (start < 0 || bytes[start + 1] !== 0x01) return null;
    const a = bytes[start + 2];
    if (a === undefined) return null;
    return { mil: (a & 0x80) !== 0, anzahl: a & 0x7f };
  };

  const disconnect = async () => {
    if (!transport) return;
    try { await transport.schliessen(); } finally {
      transport = null;
      puffer = '';
      warteAuflösung = null;
      protokoll = null;
    }
  };

  return {
    support, supported, verbunden,
    connectSerial, connectBluetooth, disconnect,
    init, send,
    readStatus, readDtcs, clearDtcs,
    readPid, readSupportedPids, livePoll, readVin,
    decodeDtc, PIDS,
    protokoll: () => protokoll
  };
})();
