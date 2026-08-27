/* ============================================================
   diag4free — Markdown-Renderer

   Warum ein eigener statt marked vom CDN: die Artikel sind der
   ausfuehrliche Teil der Wissensbasis, und genau der war offline
   unbrauchbar — ohne CDN fiel die Anzeige auf rohen Text zurueck, also
   auf Rautezeichen und Pipe-Tabellen. In einer Werkstatt ohne Netz ist
   das der Normalfall, nicht die Ausnahme.

   Der Umfang ist bewusst begrenzt auf das, was docs/ARTIKEL-STANDARD.md
   zulaesst. Ein vollstaendiger Parser waere mehr Code und mehr
   Angriffsflaeche fuer Syntax, die hier niemand schreibt.

   Sicherheit: der Eingabetext wird zuerst vollstaendig escaped. Alles
   HTML danach entsteht aus erkannten Markdown-Mustern, nie aus dem Text
   selbst — auch nicht aus Code-Bloecken.
   ============================================================ */

window.D4F_MD = (() => {
  'use strict';

  const escape = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Inline-Auszeichnung. Reihenfolge zaehlt: Code zuerst, damit
  // Sternchen innerhalb eines Code-Spans nicht als fett gelesen werden.
  //
  // Der Platzhalter muss etwas sein, das im Artikeltext nicht vorkommen
  // kann — ein Wort wie "CODE" waere genau das Gegenteil. Gewaehlt ist
  // ein Zeichen aus dem privaten Unicode-Bereich: es hat keine Bedeutung,
  // keine Darstellung und ueberlebt das Escapen unveraendert.
  const SLOT = '\uE000';

  const inline = (s) => {
    const codes = [];
    let t = s.replace(/`([^`]+)`/g, (_, c) => SLOT + (codes.push(c) - 1) + SLOT);
    t = t
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:]|$)/g, '$1<em>$2</em>');
    return t.replace(new RegExp(SLOT + '(\\d+)' + SLOT, 'g'),
      (_, i) => '<code>' + codes[i] + '</code>');
  };

  const istTrenner = (z) => /^\|?[\s:-]*-[-\s:|]*\|?$/.test(z) && z.includes('-');
  const zellen = (z) => z.replace(/^\||\|$/g, '').split('|').map(c => c.trim());

  const parse = (text, opt = {}) => {
    const zeilen = escape(String(text).replace(/\r\n/g, '\n')).split('\n');
    const out = [];
    let i = 0;

    const puffer = [];
    const absatzLeeren = () => {
      if (!puffer.length) return;
      out.push('<p>' + inline(puffer.join(' ')) + '</p>');
      puffer.length = 0;
    };

    while (i < zeilen.length) {
      const z = zeilen[i];

      if (!z.trim()) { absatzLeeren(); i++; continue; }

      // Codeblock — Inhalt bleibt woertlich, keine Inline-Auszeichnung
      const zaun = z.match(/^\s*```(\w*)\s*$/);
      if (zaun) {
        absatzLeeren();
        const inhalt = [];
        i++;
        while (i < zeilen.length && !/^\s*```\s*$/.test(zeilen[i])) inhalt.push(zeilen[i++]);
        i++;
        const sprache = zaun[1] ? ' data-lang="' + zaun[1] + '"' : '';
        out.push('<pre' + sprache + '><code>' + inhalt.join('\n') + '</code></pre>');
        continue;
      }

      // Ueberschrift, Ebene wie geschrieben. Die H1 eines Artikels
      // doppelt zwar den Drawer-Titel — das loest der Aufrufer ueber
      // `ohneTitel`, nicht der Parser durch Verschieben der Ebenen. Ein
      // Shift wuerde jede Abschnittsueberschrift eine Stufe kleiner
      // machen, als die Gestaltung sie vorsieht.
      const h = z.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        absatzLeeren();
        const stufe = h[1].length;
        out.push('<h' + stufe + '>' + inline(h[2].trim()) + '</h' + stufe + '>');
        i++;
        continue;
      }

      if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(z)) { absatzLeeren(); out.push('<hr>'); i++; continue; }

      // Tabelle: Kopfzeile plus Trennzeile
      if (z.includes('|') && i + 1 < zeilen.length && istTrenner(zeilen[i + 1])) {
        absatzLeeren();
        const kopf = zellen(z);
        i += 2;
        const reihen = [];
        while (i < zeilen.length && zeilen[i].includes('|') && zeilen[i].trim()) reihen.push(zellen(zeilen[i++]));
        out.push(
          '<div class="md-table-wrap"><table>' +
          '<thead><tr>' + kopf.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead>' +
          '<tbody>' + reihen.map(r =>
            '<tr>' + kopf.map((_, k) => '<td>' + inline(r[k] || '') + '</td>').join('') + '</tr>'
          ).join('') + '</tbody>' +
          '</table></div>'
        );
        continue;
      }

      // Blockzitat — mehrzeilig, Fortsetzung ohne Marker erlaubt.
      // Achtung: nach dem Escapen ist aus '>' bereits '&gt;' geworden.
      if (/^&gt;\s?/.test(z)) {
        absatzLeeren();
        const inhalt = [];
        while (i < zeilen.length &&
               (/^&gt;\s?/.test(zeilen[i]) ||
                (inhalt.length && zeilen[i].trim() && !/^[#\-*\d]/.test(zeilen[i])))) {
          inhalt.push(zeilen[i].replace(/^&gt;\s?/, '').trim());
          i++;
        }
        out.push('<blockquote><p>' + inline(inhalt.join(' ')) + '</p></blockquote>');
        continue;
      }

      // Listen. Ein Eintrag darf auf eingerueckten Folgezeilen
      // weiterlaufen, damit mehrzeilige Schritte zusammenbleiben.
      const liste = z.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
      if (liste) {
        absatzLeeren();
        const geordnet = /\d/.test(liste[2]);
        const eintraege = [];
        while (i < zeilen.length) {
          const m = zeilen[i].match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
          if (m && (/\d/.test(m[2]) === geordnet)) { eintraege.push(m[3]); i++; }
          // Eingerueckte Folgezeile gehoert zum letzten Eintrag —
          // ausser sie oeffnet einen Codeblock oder eine Tabelle. Die
          // wurden sonst als Fliesstext eingesammelt und verschwanden.
          else if (eintraege.length && /^\s{2,}\S/.test(zeilen[i]) &&
                   !/^\s*```/.test(zeilen[i]) &&
                   !(zeilen[i].includes('|') && i + 1 < zeilen.length && istTrenner(zeilen[i + 1]))) {
            eintraege[eintraege.length - 1] += ' ' + zeilen[i].trim();
            i++;
          } else break;
        }
        const tag = geordnet ? 'ol' : 'ul';
        out.push('<' + tag + '>' + eintraege.map(e => '<li>' + inline(e) + '</li>').join('') + '</' + tag + '>');
        continue;
      }

      puffer.push(z.trim());
      i++;
    }

    absatzLeeren();

    // Der Drawer zeigt den Titel bereits in seiner Kopfzeile. Eine
    // zweite H1 direkt darunter liest sich wie ein Fehler und bricht
    // ausserdem die Ueberschriftenfolge der Seite.
    if (opt.ohneTitel && out[0]?.startsWith('<h1>')) out.shift();

    return out.join('\n');
  };

  return { parse };
})();
