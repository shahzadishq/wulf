# Wulf & Collegen – Website-Redesign

Statischer Entwurf für kanzlei-wulf.de (HTML, CSS, JS – keine Abhängigkeiten).

**Leitlinien**
- Zielgruppe überwiegend ältere Mandanten: 19 px Grundschrift, hoher Kontrast, Schriftgrößen-Umschalter (A / A / A), große Klickflächen.
- Telefonnummern beider Kanzleien immer sichtbar.

**Gestaltung (v2, Premium)**
- Farben aus der Marke: Navy `#0B2E44`, Taupe `#B9A88E` (Logo), Weinrot `#8E1B2E`, Nebel `#E6EDF1`.
- Schriften: DM Serif Display / Text (Titel), Atkinson Hyperlegible (Text – für Menschen mit eingeschränktem Sehvermögen).
- Bewegung: Titel-Einstieg im Hero, sanftes Einblenden beim Scrollen, hochzählende Kennzahlen, Elbe-Karte, Seitenübergänge. Alles langsam und einmalig; bei „Bewegung reduzieren“ abgeschaltet.

**Offen**
- Kontaktformular an das bestehende Backend anbinden (`js/main.js`, TODO).
- Logo, Fotos und Favicon werden direkt von kanzlei-wulf.de geladen. Für den Livebetrieb lokal ablegen.
- Stichpunkte in den Fachbereichen und die Zuordnung der Ansprechpartner mit der Kanzlei abstimmen.
- Unterseiten-Links (Karriere, WebAkte, Impressum, Datenschutz, News, Podcast) gegen die echten URLs prüfen.

**Seiten:** Startseite, Fachbereiche, Anwälte, Kanzlei, Kontakt.

**Bearbeiten:** Inhalte liegen in `src/*.html`, Kopf und Fuß in `build.py`. Nach Änderungen `python3 build.py` ausführen – die fertigen Seiten landen im Hauptordner.

**Live-Vorschau:** https://shahzadishq.github.io/wulf/


## Design 2 (Alternative zur Präsentation)
Ordner `v2/` – eigenständige Startseite mit eigenem Stil: Weinrot als Hauptfarbe, Bodoni Moda + Figtree, Guilloche-Muster (wie auf Urkunden), Bögen als Bildrahmen, horizontal scrollende Rechtsgebiete, Wort-für-Wort-Satz, Schritte mit Sticky-Spalte.
Live: https://shahzadishq.github.io/wulf/v2/

## Design 3 (klassisch-premium, Farben der bestehenden Website)
Ordner `v3/` – Petrol #173F53, Karmin #970D32, Playfair Display + Open Sans. Hintergrundbilder (Magdeburger Dom, Team), Muster, Feature-Boxen, Rechtsgebiete mit Bild-Hover, Zähler, Ablauf (sticky), Team-Karten, Frist-Banner, FAQ (echte Inhalte), Ratgeber (echte Artikel), Kontakt mit Anfahrt/Parken.
Live: https://shahzadishq.github.io/wulf/v3/
