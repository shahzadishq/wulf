(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Schriftgröße (wird gemerkt) ---------- */
  var sizeBtns = document.querySelectorAll('.textsize button');
  function setSize(n) {
    root.setAttribute('data-size', n);
    sizeBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.size === n)); });
    try { localStorage.setItem('wulf-size', n); } catch (e) {}
  }
  sizeBtns.forEach(function (b) { b.addEventListener('click', function () { setSize(b.dataset.size); }); });
  setSize(root.getAttribute('data-size') || '1');

  /* ---------- Header: wird beim Scrollen fest ---------- */
  var header = document.querySelector('.header');
  var fab = document.querySelector('.callfab');
  var heroImg = document.querySelector('.hero__photo img');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-solid', y > 60);
    if (fab) fab.classList.toggle('is-shown', y > 250);
    if (heroImg && !reduce && y < 1000) heroImg.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Mobiles Menü ---------- */
  var toggle = document.querySelector('.navtoggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    var label = toggle.querySelector('.navtoggle__text');
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Schließen' : 'Menü';
    };
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });
  }

  /* ---------- Hero-Einstieg ---------- */
  var hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(function () { setTimeout(function () { hero.classList.add('is-ready'); }, 80); });

  /* ---------- Zahlen zählen hoch ---------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10);
    var fmt = function (v) { return v.toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    if (reduce) { el.textContent = fmt(target); return; }
    var start = null, dur = 1800;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Einblenden beim Scrollen ---------- */
  var items = document.querySelectorAll('.reveal, [data-inview], [data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        if (el.dataset.count) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); if (el.dataset.count) countUp(el); });
  }

  /* ---------- Inhaltsverzeichnis markiert aktuellen Abschnitt ---------- */
  var tocLinks = document.querySelectorAll('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var tocIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && byId[en.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove('is-active'); });
          byId[en.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) tocIo.observe(s); });
  }


  /* ---------- Live-Status: Jetzt erreichbar? (Zeit in Deutschland) ---------- */
  var statusEls = document.querySelectorAll('[data-status]');
  if (statusEls.length) {
    var updateStatus = function () {
      var parts = {};
      try {
        new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
          .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      } catch (e) { return; }
      var days = ['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.', 'So.'];
      var d = days.indexOf(parts.weekday), h = parseInt(parts.hour, 10);
      if (d < 0 || isNaN(h)) return;
      var open = d <= 4 && h >= 8 && h < 20, text;
      if (open) text = 'Jetzt erreichbar – heute bis 20 Uhr';
      else if (d <= 3 && h >= 20) text = 'Morgen ab 8 Uhr wieder erreichbar';
      else if (d <= 4 && h < 8) text = 'Heute ab 8 Uhr erreichbar';
      else text = 'Am Montag ab 8 Uhr wieder erreichbar';
      statusEls.forEach(function (el) {
        el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open);
        el.querySelector('.status__text').textContent = text;
      });
    };
    updateStatus(); setInterval(updateStatus, 60000);
  }

  /* ---------- Scroll-Fortschritt ---------- */
  var bar = document.querySelector('.progress');
  if (bar) {
    var setBar = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    };
    window.addEventListener('scroll', function () { requestAnimationFrame(setBar); }, { passive: true });
    setBar();
  }

  /* ---------- Lichtkegel folgt der Maus (nur Desktop) ---------- */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduce) {
    document.querySelectorAll('[data-spot]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    /* sanfte 3D-Neigung der Teamkarten */
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, yv = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(900px) rotateX(' + (-yv * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Formular ---------- */
  var form = document.getElementById('form');
  if (form) {
    var checks = [
      ['f-name', function (el) { return el.value.trim().length > 1; }],
      ['f-mail', function (el) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()); }],
      ['f-msg', function (el) { return el.value.trim().length > 4; }],
      ['f-ok', function (el) { return el.checked; }]
    ];
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      checks.forEach(function (c) {
        var el = document.getElementById(c[0]);
        var ok = c[1](el);
        var field = el.closest('.field');
        var err = field.querySelector('.field__error');
        field.classList.toggle('has-error', !ok);
        if (!ok) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', err.id); if (!firstBad) firstBad = el; }
        else { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }
      });
      if (firstBad) { firstBad.focus(); return; }
      /* TODO: an das bestehende WordPress- oder Mail-Backend anbinden */
      var btn = form.querySelector('button[type="submit"]');
      var lbl = btn.querySelector('.btn__label');
      btn.classList.add('is-loading'); if (lbl) lbl.textContent = 'Wird gesendet …';
      setTimeout(function () {
        Array.prototype.forEach.call(form.children, function (n) { if (!n.classList.contains('form__done')) n.hidden = true; });
        var done = form.querySelector('.form__done');
        done.hidden = false; done.setAttribute('tabindex', '-1'); done.focus();
      }, reduce ? 0 : 1100);
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
