{
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Schriftgröße */
  const sb = $$('.tsize button');
  const setSize = n => { root.setAttribute('data-size', n); sb.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.size === n))); try { localStorage.setItem('wulf3-size', n); } catch (e) {} };
  sb.forEach(b => b.addEventListener('click', () => setSize(b.dataset.size)));
  setSize(root.getAttribute('data-size') || '1');

  /* Menü */
  const burger = $('.burger'), nav = $('#nav');
  const setNav = o => { nav.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o)); document.body.style.overflow = o ? 'hidden' : ''; };
  burger.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); burger.focus(); } });

  /* Zähler */
  const countUp = el => {
    const t = parseFloat(el.dataset.count), d = +el.dataset.dec || 0;
    const f = v => v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
    if (reduce) { el.textContent = f(t); return; }
    let s = null;
    const tick = n => { s ??= n; const p = Math.min((n - s) / 2000, 1); el.textContent = f(t * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };

  /* Einblenden beim Scrollen */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.matches('[data-count]')) countUp(e.target);
    io.unobserve(e.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  $$('.rv, .rv-zoom, [data-count]').forEach(el => io.observe(el));

  /* Aktiver Menüpunkt */
  const links = $$('.nav a[href^="#"]');
  const secIo = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.getAttribute('href')); if (s) secIo.observe(s); });

  /* Scroll-Effekte */
  const head = $('#head'), top = $('.totop'), heroImg = $('.hero__bg img');
  const pars = $$('.counter__bg img, .alert__bg img');
  const stepEls = $$('.step'), stepsSec = $('.steps'), meter = $('.steps__meter');
  const onScroll = () => {
    const y = scrollY, vh = innerHeight;
    head.classList.toggle('is-stuck', y > 60);
    const max = root.scrollHeight - vh;
    top.classList.toggle('show', y > 600);
    top.style.setProperty('--p', max > 0 ? (y / max).toFixed(3) : 0);
    if (!reduce) {
      if (heroImg && y < vh * 1.2) heroImg.parentElement.style.transform = 'translate3d(0,' + (y * 0.25).toFixed(1) + 'px,0)';
      pars.forEach(img => { const r = img.parentElement.parentElement.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) img.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -0.18).toFixed(1) + 'px,0)'; });
    }
    if (stepEls.length && innerWidth > 960) {
      let best = 0, bd = Infinity;
      stepEls.forEach((s, i) => { const r = s.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - vh * .5); if (d < bd) { bd = d; best = i; } });
      stepEls.forEach((s, i) => s.classList.toggle('on', i === best));
      const r = stepsSec.getBoundingClientRect();
      meter.style.setProperty('--sp', Math.min(Math.max((vh * .5 - r.top) / r.height, 0), 1).toFixed(3));
    } else stepEls.forEach(s => s.classList.add('on'));
  };
  let tk = false;
  addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(() => { onScroll(); tk = false; }); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  top.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* FAQ: immer nur eine Frage offen */
  $$('.acc__i').forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('.acc__i').forEach(o => { if (o !== d) o.open = false; }); }));

  /* Erreichbarkeit (deutsche Zeit) */
  const live = () => {
    const p = {};
    try { new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).forEach(x => p[x.type] = x.value); } catch (e) { return; }
    const d = ['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.', 'So.'].indexOf(p.weekday), h = +p.hour;
    if (d < 0) return;
    const open = d <= 4 && h >= 8 && h < 20;
    const txt = open ? 'Jetzt erreichbar – heute bis 20:00 Uhr' : (d <= 3 && h >= 20) ? 'Morgen ab 08:00 Uhr erreichbar' : (d <= 4 && h < 8) ? 'Heute ab 08:00 Uhr erreichbar' : 'Montag ab 08:00 Uhr erreichbar';
    $$('[data-live]').forEach(el => el.textContent = txt);
    $$('[data-live-pill]').forEach(el => { el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open); $('span', el).textContent = txt; });
  };
  live(); setInterval(live, 60000);

  /* Formular */
  const form = $('#form3');
  if (form) {
    const rules = [['#n3', el => el.value.trim().length > 1], ['#m3', el => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())], ['#x3', el => el.value.trim().length > 4], ['#c3', el => el.checked]];
    form.addEventListener('submit', e => {
      e.preventDefault();
      let first = null;
      rules.forEach(([s, ok]) => { const el = $(s, form), w = el.closest('.ff, .fchk'), g = ok(el); w.classList.toggle('bad', !g); el.setAttribute('aria-invalid', String(!g)); if (!g && !first) first = el; });
      if (first) { first.focus(); return; }
      const btn = $('button[type="submit"]', form); btn.classList.add('busy'); $('.lbl', btn).textContent = 'Wird gesendet …';
      /* TODO: an das Mail- oder WordPress-Backend anbinden */
      setTimeout(() => { [...form.children].forEach(c => { if (!c.classList.contains('done')) c.hidden = true; }); const d = $('.done', form); d.hidden = false; d.tabIndex = -1; d.focus(); }, reduce ? 0 : 1100);
    });
  }
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
}
