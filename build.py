#!/usr/bin/env python3
"""Baut die statischen Seiten aus src/*.html mit gemeinsamem Kopf und Fuß.

Aufruf:  python3 build.py
Jede Datei in src/ beginnt mit einer Kommentarzeile:
<!-- title: Seitentitel | description: Meta-Beschreibung | nav: schluessel -->
"""
import pathlib, re, time
VERSION = time.strftime("%Y%m%d%H%M")

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
  <symbol id="i-brief" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12.5h18M11 12v2h2v-2"/></g></symbol>
  <symbol id="i-family" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8" cy="6" r="2.5"/><circle cx="16" cy="6" r="2.5"/><circle cx="12" cy="13" r="1.8"/><path d="M3.5 20v-4.5A4.5 4.5 0 0 1 8 11M20.5 20v-4.5A4.5 4.5 0 0 0 16 11M9.5 20v-1.5a2.5 2.5 0 0 1 5 0V20"/></g></symbol>
  <symbol id="i-scroll" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h11a2 2 0 0 1 2 2v1h-4M7 3a2 2 0 0 0-2 2v13a3 3 0 0 0 3 3h9a2 2 0 0 0 2-2V6M7 3a2 2 0 0 1 2 2v1"/><path d="M9 10h6M9 13.5h6M9 17h3.5"/></g></symbol>
  <symbol id="i-house" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 11 12 4l9 7M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/></g></symbol>
  <symbol id="i-scale" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v17M7 20h10M5 6h14M12 6"/><path d="m5 6-3 7a3 3 0 0 0 6 0zM19 6l-3 7a3 3 0 0 0 6 0z"/></g></symbol>
  <symbol id="i-hands" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1.4 1.4 0 0 0 2-2M13.5 14.5 16 17a1.4 1.4 0 0 0 2-2l-3.9-3.9a2 2 0 0 0-2.8 0l-.9.9a1.4 1.4 0 0 1-2-2L10.9 7.5a3 3 0 0 1 3.8-.3l.6.4a2 2 0 0 0 1.6.3L19 7.5"/><path d="M21 6.5 22 15h-2.5M3 6.5 2 15l6.5 6a1.4 1.4 0 0 0 2-2M2 7.5h2.6a2 2 0 0 0 1.5-.6L8 5"/></g></symbol>
  <symbol id="i-send" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></symbol>
  <symbol id="i-spark" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c.6 4.6 2.4 7.4 7 8-4.6.6-6.4 3.4-7 8-.6-4.6-2.4-7.4-7-8 4.6-.6 6.4-3.4 7-8z"/></symbol>
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
  <link rel="stylesheet" href="css/styles.css?v={ver}">
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
        <ul class="fcontact">
          <li><svg><use href="#i-pin"/></svg><a href="https://www.google.com/maps/search/?api=1&amp;query=Breiter+Weg+31+39104+Magdeburg">Breiter Weg 31<br>39104 Magdeburg</a></li>
          <li><svg><use href="#i-phone"/></svg><a class="footer__phone" href="tel:+4939173746100">0391 737 461 00</a></li>
        </ul>
      </div>
      <div>
        <h2>Kanzlei Stendal</h2>
        <ul class="fcontact">
          <li><svg><use href="#i-pin"/></svg><a href="https://www.google.com/maps/search/?api=1&amp;query=Breite+Stra%C3%9Fe+54+39576+Stendal">Breite Straße 54<br>39576 Stendal</a></li>
          <li><svg><use href="#i-phone"/></svg><a class="footer__phone" href="tel:+4939312527222">03931 252 72 22</a></li>
        </ul>
      </div>
      <div>
        <h2>Service</h2>
        <ul>
          <li class="fcontact__mail"><svg><use href="#i-mail"/></svg><a href="mailto:info@kanzlei-wulf.de">info@kanzlei-wulf.de</a></li>
          <li class="fcontact__mail"><svg><use href="#i-clock"/></svg><span>Mo–Fr, 8 bis 20 Uhr</span></li>
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

  <script src="js/main.js?v=__VER__"></script>
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
        page = HEAD.format(title=meta["title"], description=meta["description"], nav=nav, live=LIVE, sprite=SPRITE, header_class=header_class, ver=VERSION)
        if meta.get("nav") == "start":
            page = page.replace('href="kontakt.html#formular">Anliegen schildern</a>\n      </nav>', 'href="#kontakt">Anliegen schildern</a>\n      </nav>')
            page = page.replace('<a class="skip"', '<div class="progress" aria-hidden="true"></div>\n  <a class="skip"')
        page += body.replace("{live}", LIVE) + FOOT.replace("__VER__", VERSION)
        (ROOT / src.name).write_text(page, encoding="utf-8")
        print("gebaut:", src.name)


if __name__ == "__main__":
    build()
