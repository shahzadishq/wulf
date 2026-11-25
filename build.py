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

SPRITE = """<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-phone" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></g></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></symbol>
  <symbol id="i-video" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/></g></symbol>
  <symbol id="i-office" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 21V5l8-2v18M12 8h8v13M2 21h20"/><path d="M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"/></g></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path fill="currentColor" d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></g></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></g></symbol>
</svg>"""

HEAD = """<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="theme-color" content="#082436">
  <link rel="icon" href="{live}/2026/09/cropped-FavIcon_W-C_512-270x270.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=DM+Serif+Display:ital@0;1&family=DM+Serif+Text&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
  <script>document.documentElement.classList.add('js');try{{var s=localStorage.getItem('wulf-size');if(s)document.documentElement.setAttribute('data-size',s)}}catch(e){{}}</script>
</head>
<body>
  {sprite}
  <a class="skip" href="#inhalt">Zum Inhalt springen</a>

  <div class="topbar">
    <div class="wrap topbar__inner">
      <p class="topbar__hours"><svg class="ico"><use href="#i-clock"/></svg> Montag bis Freitag, 8 bis 20 Uhr</p>
      <ul class="topbar__phones">
        <li><span>Magdeburg</span><a href="tel:+4939173746100">0391 737 461 00</a></li>
        <li><span>Stendal</span><a href="tel:+4939312527222">03931 252 72 22</a></li>
      </ul>
      <div class="textsize" role="group" aria-label="Schriftgröße">
        <span id="ts-label">Schrift</span>
        <button type="button" data-size="1" aria-pressed="true" aria-describedby="ts-label" aria-label="Normale Schrift">A</button>
        <button type="button" data-size="2" aria-pressed="false" aria-describedby="ts-label" aria-label="Große Schrift" class="ts-lg">A</button>
        <button type="button" data-size="3" aria-pressed="false" aria-describedby="ts-label" aria-label="Sehr große Schrift" class="ts-xl">A</button>
      </div>
    </div>
  </div>

  <header class="header {header_class}">
    <div class="wrap header__inner">
      <a class="brand" href="index.html" aria-label="Wulf &amp; Collegen Rechtsanwälte, zur Startseite">
        <img class="brand__logo" src="{live}/2022/05/Logo_ohne_Rand.webp" alt="" width="614" height="219" onerror="this.parentNode.classList.add('no-logo')">
        <span class="brand__fallback">WULF &amp; COLLEGEN</span>
      </a>
      <button class="navtoggle" type="button" aria-expanded="false" aria-controls="nav"><span class="navtoggle__bars" aria-hidden="true"></span><span class="navtoggle__text">Menü</span></button>
      <nav id="nav" class="nav" aria-label="Hauptnavigation">
        <ul>
{nav}
          <li><a href="https://kanzlei-wulf.de/webakte/">WebAkte</a></li>
        </ul>
        <a class="btn btn--sm" href="kontakt.html#formular">Anliegen schildern</a>
      </nav>
    </div>
  </header>

  <main id="inhalt">"""

FOOT = """  </main>

  <footer class="footer">
    <div class="wrap footer__top">
      <div>
        <p class="footer__brand">Rechtsanwälte<br>Wulf &amp; Collegen</p>
        <p>Klar beraten. Vorausschauend begleitet. Mitglied im internationalen Kanzleinetzwerk Avolink.</p>
      </div>
      <div>
        <h2>Kanzlei Magdeburg</h2>
        <p>Breiter Weg 31<br>39104 Magdeburg<br><a class="footer__phone" href="tel:+4939173746100">0391 737 461 00</a></p>
      </div>
      <div>
        <h2>Kanzlei Stendal</h2>
        <p>Breite Straße 54<br>39576 Stendal<br><a class="footer__phone" href="tel:+4939312527222">03931 252 72 22</a></p>
      </div>
      <div>
        <h2>Service</h2>
        <ul>
          <li><a href="mailto:info@kanzlei-wulf.de">info@kanzlei-wulf.de</a></li>
          <li><a href="https://kanzlei-wulf.de/webakte/">WebAkte</a></li>
          <li><a href="https://kanzlei-wulf.de/news/">Ratgeber und News</a></li>
          <li><a href="https://kanzlei-wulf.de/podcast/">Podcast</a></li>
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

  <div class="callfab" aria-label="Schnell anrufen">
    <a href="tel:+4939173746100"><span>Magdeburg</span><strong>Anrufen</strong></a>
    <a href="tel:+4939312527222"><span>Stendal</span><strong>Anrufen</strong></a>
  </div>

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
        header_class = "header--over" if meta.get("nav") == "start" else "header--page"
        page = HEAD.format(title=meta["title"], description=meta["description"], nav=nav, live=LIVE, sprite=SPRITE, header_class=header_class)
        page += body.replace("{live}", LIVE) + FOOT
        (ROOT / src.name).write_text(page, encoding="utf-8")
        print("gebaut:", src.name)


if __name__ == "__main__":
    build()
