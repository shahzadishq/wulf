{
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Schriftgröße ---------- */
  const sizeBtns = $$('.tsize button');
  const setSize = n => {
    root.setAttribute('data-size', n);
    sizeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.size === n)));
    try { localStorage.setItem('wulf2-size', n); } catch (e) {}
  };
  sizeBtns.forEach(b => b.addEventListener('click', () => setSize(b.dataset.size)));
  setSize(root.getAttribute('data-size') || '1');

  /* ---------- Menü ---------- */
  const burger = $('.burger'), menu = $('#menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); } });

  /* ---------- Hero-Titel: Wörter einzeln einblenden ---------- */
  $$('.hero__title .w').forEach((w, i) => {
    const inner = document.createElement('span');
    inner.className = 'in';
    inner.style.setProperty('--d', (0.25 + i * 0.12) + 's');
    while (w.firstChild) inner.appendChild(w.firstChild);
    w.appendChild(inner);
  });

  /* ---------- Guilloche-Muster (wie auf Urkunden) ---------- */
  const guilloche = (svg, R, r, d, loops, rings) => {
    const NS = 'http://www.w3.org/2000/svg';
    for (let k = 0; k < rings; k++) {
      const scale = 1 - k * 0.12, off = k * 0.35;
      let dStr = '';
      const steps = 1400;
      for (let s = 0; s <= steps; s++) {
        const t = (s / steps) * Math.PI * 2 * loops;
        const x = ((R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t + off)) * scale;
        const y = ((R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t + off)) * scale;
        dStr += (s ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', dStr);
      svg.appendChild(p);
      const len = Math.ceil(p.getTotalLength());
      p.style.setProperty('--len', len);
      p.style.transitionDelay = (k * 0.35) + 's';
    }
  };
  const g1 = $('#guilloche'), g2 = $('#guilloche2');
  if (g1) guilloche(g1, 200, 37, 120, 37, 4);
  if (g2) guilloche(g2, 210, 53, 90, 53, 3);

  /* ---------- Seite geladen → Einstieg starten ---------- */
  let started = false;
  const start = () => {
    if (started) return; started = true;
    requestAnimationFrame(() => {
      document.body.classList.add('is-loaded');
      g1 && g1.classList.add('on');
    });
  };
  /* erst starten, wenn die Schriften da sind (max. 1,5 s warten) */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  setTimeout(start, 1500);

  /* ---------- Einblenden beim Scrollen ---------- */
  const countUp = el => {
    const target = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0;
    const fmt = v => v.toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduce) { el.textContent = fmt(target); return; }
    let start = null;
    const tick = t => {
      start ??= t;
      const p = Math.min((t - start) / 2000, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add('in');
    if (el.matches('[data-count]')) countUp(el);
    if (el === g2) g2.classList.add('on');
    io.unobserve(el);
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.rv, [data-count]').forEach(el => io.observe(el));
  if (g2) io.observe(g2);

  /* ---------- Satz färbt sich Wort für Wort beim Scrollen ---------- */
  const statement = $('[data-words]');
  let words = [];
  if (statement) {
    const txt = statement.textContent.trim();
    statement.setAttribute('aria-label', txt);
    statement.innerHTML = txt.split(/\s+/).map(w => '<span class="wd" aria-hidden="true">' + w + '</span>').join(' ');
    words = $$('.wd', statement);
  }

  /* ---------- Rechtsgebiete: horizontal beim Scrollen ---------- */
  const hs = $('.hscroll'), track = $('.hscroll__track'), hbar = $('.hscroll__bar');
  let hsOn = false;
  const sizeHs = () => {
    hsOn = innerWidth > 900 && !reduce;
    if (!hs) return;
    if (!hsOn) { hs.style.height = ''; track.style.transform = ''; return; }
    const extra = track.scrollWidth - innerWidth;
    hs.style.height = (innerHeight + Math.max(extra, 0)) + 'px';
  };
  addEventListener('resize', sizeHs);
  addEventListener('load', sizeHs);
  sizeHs();

  /* ---------- Ablauf: aktiver Schritt ---------- */
  const stepEls = $$('.step'), steps = $('.steps'), meter = $('.steps__meter');

  /* ---------- Weitere Scroll-Effekte ---------- */
  const top = $('.top'), bar = $('.scrollbar'), fab = $('.fab');
  const par = $$('[data-parallax]');
  const onScroll = () => {
    const y = scrollY, vh = innerHeight;
    top.classList.toggle('is-solid', y > 40);
    fab && fab.classList.toggle('show', y > 400);
    const max = root.scrollHeight - vh;
    bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

    if (!reduce) {
      if (g1) g1.style.rotate = (y * 0.03) + 'deg';
      if (g2) g2.style.rotate = (-y * 0.02) + 'deg';
      par.forEach(el => { const r = el.getBoundingClientRect(); el.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * -parseFloat(el.dataset.parallax)).toFixed(1) + 'px'; });
    }

    if (words.length) {
      const r = statement.getBoundingClientRect();
      const p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    }

    if (hsOn && hs) {
      const r = hs.getBoundingClientRect();
      const total = hs.offsetHeight - vh;
      const p = Math.min(Math.max(-r.top / total, 0), 1);
      const extra = track.scrollWidth - innerWidth;
      track.style.transform = 'translate3d(' + (-p * extra).toFixed(1) + 'px,0,0)';
      hbar.style.setProperty('--hp', p.toFixed(3));
    }

    if (stepEls.length && innerWidth > 900) {
      let best = 0, bestD = Infinity;
      stepEls.forEach((s, i) => { const r = s.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - vh * 0.5); if (d < bestD) { bestD = d; best = i; } });
      stepEls.forEach((s, i) => s.classList.toggle('on', i === best));
      const r = steps.getBoundingClientRect();
      meter.style.setProperty('--sp', Math.min(Math.max((vh * 0.5 - r.top) / r.height, 0), 1).toFixed(3));
    } else stepEls.forEach(s => s.classList.add('on'));
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Live-Erreichbarkeit (deutsche Zeit) ---------- */
  const live = () => {
    let parts = {};
    try {
      new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', hour: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(p => parts[p.type] = p.value);
    } catch (e) { return; }
    const d = ['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.', 'So.'].indexOf(parts.weekday), h = +parts.hour;
    if (d < 0) return;
    const open = d <= 4 && h >= 8 && h < 20;
    const txt = open ? 'Jetzt erreichbar – heute bis 20 Uhr'
      : (d <= 3 && h >= 20) ? 'Morgen ab 8 Uhr wieder erreichbar'
      : (d <= 4 && h < 8) ? 'Heute ab 8 Uhr erreichbar' : 'Am Montag ab 8 Uhr wieder erreichbar';
    $$('[data-live]').forEach(el => el.textContent = txt);
    $$('[data-live-pill]').forEach(el => { el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open); $('.live__txt', el).textContent = txt; });
  };
  live(); setInterval(live, 60000);

  /* ---------- Formular ---------- */
  const form = $('#form2');
  if (form) {
    const rules = [
      ['#n2', el => el.value.trim().length > 1],
      ['#m2', el => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())],
      ['#x2', el => el.value.trim().length > 4],
      ['#c2', el => el.checked]
    ];
    form.addEventListener('submit', e => {
      e.preventDefault();
      let first = null;
      rules.forEach(([sel, ok]) => {
        const el = $(sel, form), wrap = el.closest('.fl__f, .chk'), good = ok(el);
        wrap.classList.toggle('has-err', !good);
        el.setAttribute('aria-invalid', String(!good));
        if (!good && !first) first = el;
      });
      if (first) { first.focus(); return; }
      const btn = $('button[type="submit"]', form);
      btn.classList.add('is-busy'); $('.lbl', btn).textContent = 'Wird gesendet …';
      /* TODO: an das Mail- oder WordPress-Backend anbinden */
      setTimeout(() => {
        [...form.children].forEach(c => { if (!c.classList.contains('done')) c.hidden = true; });
        const done = $('.done', form); done.hidden = false; done.tabIndex = -1; done.focus();
      }, reduce ? 0 : 1100);
    });
  }

  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
}
