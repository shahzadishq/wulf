# Wulf & Collegen – Website-Redesign

Statischer Entwurf für kanzlei-wulf.de (HTML, CSS, JS – keine Abhängigkeiten).

**Leitlinien**
- Zielgruppe überwiegend ältere Mandanten: 19 px Grundschrift, hoher Kontrast, Schriftgrößen-Umschalter (A / A / A), große Klickflächen.
- Telefonnummern beider Kanzleien immer sichtbar.
- Genau eine Animation: Die Elbe-Karte im Kopfbereich zeichnet sich beim Laden und verbindet Magdeburg und Stendal. Bei „Bewegung reduzieren“ wird sie statisch angezeigt.

**Gestaltung**
- Farben: Domgrün `#1F3A36`, Stein `#EEF1ED`, Papier `#FBFCFA`, Siegelrot `#7A2E2E` (nur für Fristen-Hinweis und Fokus).
- Schriften: Literata (Überschriften), Atkinson Hyperlegible (Text – entwickelt für Menschen mit eingeschränktem Sehvermögen).

**Offen**
- Kontaktformular an das bestehende Backend anbinden (`js/main.js`, TODO).
- Logo, Fotos und Favicon werden direkt von kanzlei-wulf.de geladen. Für den Livebetrieb lokal ablegen.
- Stichpunkte in den Fachbereichen und die Zuordnung der Ansprechpartner mit der Kanzlei abstimmen.
- Unterseiten-Links (Karriere, WebAkte, Impressum, Datenschutz, News, Podcast) gegen die echten URLs prüfen.

**Seiten:** Startseite, Fachbereiche, Anwälte, Kanzlei, Kontakt.

**Bearbeiten:** Inhalte liegen in `src/*.html`, Kopf und Fuß in `build.py`. Nach Änderungen `python3 build.py` ausführen – die fertigen Seiten landen im Hauptordner.

**Vorschau:** https://raw.githack.com/shahzadishq/wulf/main/index.html
