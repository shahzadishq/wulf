#!/usr/bin/env python3
"""Baut die statischen Seiten aus src/*.html mit gemeinsamem Kopf und Fuß.

Aufruf:  python3 build.py
Jede Datei in src/ beginnt mit einer Kommentarzeile:
<!-- title: Seitentitel | description: Meta-Beschreibung | nav: schluessel -->
"""
import pathlib, re

ROOT = pathlib.Path(__file__).parent
LIVE = "https://kanzlei-wulf.de/wp-content/uploads"

NAV = [
    ("start", "index.html", "Startseite"),
    ("fachbereiche", "fachbereiche.html", "Fachbereiche"),
    ("anwaelte", "anwaelte.html", "Anwälte"),
    ("kanzlei", "kanzlei.html", "Kanzlei"),
    ("kontakt", "kontakt.html", "Kontakt"),
]

HEAD = """<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <link rel="icon" href="{live}/2026/09/cropped-FavIcon_W-C_512-270x270.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
  <script>document.documentElement.classList.add('js');try{{var s=localStorage.getItem('wulf-size');if(s)document.documentElement.setAttribute('data-size',s)}}catch(e){{}}</script>
</head>
<body>
  <a class="skip" href="#inhalt">Zum Inhalt springen</a>

  <div class="callbar">
    <div class="wrap callbar__inner">
      <p class="callbar__hours">Mo–Fr, 8 bis 20 Uhr erreichbar</p>
      <ul class="callbar__phones">
        <li><span>Magdeburg</span> <a href="tel:+4939173746100">0391 737 461 00</a></li>
        <li><span>Stendal</span> <a href="tel:+4939312527222">03931 252 72 22</a></li>
      </ul>
      <div class="textsize" role="group" aria-label="Schriftgröße">
        <span id="ts-label">Schrift</span>
        <button type="button" data-size="1" aria-pressed="true" aria-describedby="ts-label">A</button>
        <button type="button" data-size="2" aria-pressed="false" aria-describedby="ts-label" class="ts-lg">A</button>
        <button type="button" data-size="3" aria-pressed="false" aria-describedby="ts-label" class="ts-xl">A</button>
      </div>
    </div>
  </div>

  <header class="header">
    <div class="wrap header__inner">
      <a class="brand" href="index.html" aria-label="Wulf &amp; Collegen Rechtsanwälte, zur Startseite">
        <img class="brand__logo" src="{live}/2022/05/Logo_ohne_Rand.png" alt="" onerror="this.parentNode.classList.add('no-logo')">
        <span class="brand__fallback">
          <svg class="brand__mark" viewBox="0 0 48 48" aria-hidden="true">
            <rect x="1" y="1" width="46" height="46" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 14 L17 35 L24 19 L31 35 L38 14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
          </svg>
          <span class="brand__text"><strong>Wulf &amp; Collegen</strong><small>Rechtsanwälte</small></span>
        </span>
      </a>
      <button class="navtoggle" type="button" aria-expanded="false" aria-controls="nav">Menü</button>
      <nav id="nav" class="nav" aria-label="Hauptnavigation">
        <ul>
{nav}
          <li><a href="https://kanzlei-wulf.de/webakte/">WebAkte</a></li>
        </ul>
        <a class="btn btn--small" href="kontakt.html#formular">Anliegen schildern</a>
      </nav>
    </div>
  </header>

  <main id="inhalt">"""

FOOT = """  </main>

  <footer class="footer">
    <div class="wrap footer__grid">
      <div>
        <p class="footer__brand">Rechtsanwälte Wulf &amp; Collegen</p>
        <p>Mitglied im internationalen Kanzleinetzwerk Avolink.</p>
      </div>
      <div>
        <h2>Kanzlei Magdeburg</h2>
        <p>Breiter Weg 31, 39104 Magdeburg<br><a href="tel:+4939173746100">0391 737 461 00</a></p>
      </div>
      <div>
        <h2>Kanzlei Stendal</h2>
        <p>Breite Straße 54, 39576 Stendal<br><a href="tel:+4939312527222">03931 252 72 22</a></p>
      </div>
      <div>
        <h2>Service</h2>
        <ul>
          <li><a href="https://kanzlei-wulf.de/news/">Ratgeber und News</a></li>
          <li><a href="https://kanzlei-wulf.de/podcast/">Podcast</a></li>
          <li><a href="https://kanzlei-wulf.de/webakte/">WebAkte</a></li>
          <li><a href="https://kanzlei-wulf.de/karriere/">Karriere</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap footer__legal">
      <p>© <span id="year">2026</span> Rechtsanwälte Wulf &amp; Collegen</p>
      <ul>
        <li><a href="https://kanzlei-wulf.de/impressum/">Impressum</a></li>
        <li><a href="https://kanzlei-wulf.de/datenschutz/">Datenschutz</a></li>
      </ul>
    </div>
  </footer>

  <script src="js/main.js"></script>
</body>
</html>
"""


def build():
    for src in sorted((ROOT / "src").glob("*.html")):
        text = src.read_text(encoding="utf-8")
        meta = dict(re.findall(r"(\w+):\s*([^|>]+?)\s*(?:\||-->)", text.split("\n", 1)[0]))
        body = text.split("\n", 1)[1]
        nav = "\n".join(
            f'          <li><a href="{href}"{" aria-current=\"page\"" if key == meta.get("nav") else ""}>{label}</a></li>'
            for key, href, label in NAV
        )
        page = HEAD.format(title=meta["title"], description=meta["description"], nav=nav, live=LIVE)
        page += body.replace("{live}", LIVE) + FOOT
        (ROOT / src.name).write_text(page, encoding="utf-8")
        print("gebaut:", src.name)


if __name__ == "__main__":
    build()
