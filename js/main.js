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
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); };
  function markField(el, ok) {
    var field = el.closest('.field');
    var err = field && field.querySelector('.field__error');
    if (field) field.classList.toggle('has-error', !ok);
    if (!ok) { el.setAttribute('aria-invalid', 'true'); if (err) el.setAttribute('aria-describedby', err.id); }
    else { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }
    return ok;
  }
  function showDone(form) {
    var btn = form.querySelector('button[type="submit"]');
    var lbl = btn && btn.querySelector('.btn__label');
    if (btn) btn.classList.add('is-loading');
    if (lbl) lbl.textContent = 'Wird gesendet …';
    /* TODO: an das bestehende WordPress- oder Mail-Backend anbinden */
    setTimeout(function () {
      Array.prototype.forEach.call(form.children, function (n) { if (!n.classList.contains('form__done')) n.hidden = true; });
      var done = form.querySelector('.form__done');
      done.hidden = false; done.setAttribute('tabindex', '-1'); done.focus();
    }, reduce ? 0 : 1100);
  }

  var form = document.getElementById('form');
  if (form && form.classList.contains('mform')) {
    /* Mehrstufig: Thema → Anliegen → Kontakt */
    var steps = form.querySelectorAll('.mstep');
    var marks = form.querySelectorAll('.msteps li');
    var back = form.querySelector('.mnav__back'), next = form.querySelector('.mnav__next'), send = form.querySelector('.mnav__send');
    var nowEl = form.querySelector('[data-step-now]');
    var cur = 0;
    var validate = function (i) {
      var st = steps[i];
      if (i === 0) {
        var ok = !!form.querySelector('input[name="topic"]:checked');
        st.classList.toggle('has-error', !ok);
        if (!ok) st.querySelector('input[name="topic"]').focus();
        return ok;
      }
      if (i === 1) {
        var m = document.getElementById('f-msg');
        if (!markField(m, m.value.trim().length > 4)) { m.focus(); return false; }
        return true;
      }
      var first = null;
      [['f-name', function (el) { return el.value.trim().length > 1; }],
       ['f-mail', function (el) { return emailOk(el.value); }],
       ['f-ok', function (el) { return el.checked; }]].forEach(function (c) {
        var el = document.getElementById(c[0]);
        if (!markField(el, c[1](el)) && !first) first = el;
      });
      if (first) { first.focus(); return false; }
      return true;
    };
    var go = function (i, dir) {
      form.setAttribute('data-dir', dir);
      steps[cur].classList.remove('is-active');
      cur = i;
      steps[cur].classList.add('is-active');
      marks.forEach(function (m, k) { m.classList.toggle('is-done', k < cur); m.classList.toggle('is-current', k === cur); });
      if (nowEl) nowEl.textContent = String(cur + 1);
      back.hidden = cur === 0;
      next.hidden = cur === steps.length - 1;
      send.hidden = cur !== steps.length - 1;
      var focusable = steps[cur].querySelector('input:not([type="radio"]), textarea') || steps[cur].querySelector('input:checked, input');
      if (focusable && dir) setTimeout(function () { focusable.focus({ preventScroll: true }); }, 60);
      var top = form.getBoundingClientRect().top;
      if (top < 80) window.scrollBy({ top: top - 110, behavior: reduce ? 'auto' : 'smooth' });
    };
    next.addEventListener('click', function () { if (validate(cur)) go(cur + 1, 'next'); });
    back.addEventListener('click', function () { go(cur - 1, 'back'); });
    /* Thema gewählt → automatisch weiter */
    form.querySelectorAll('input[name="topic"]').forEach(function (r) {
      r.addEventListener('change', function () {
        steps[0].classList.remove('has-error');
        setTimeout(function () { if (cur === 0) go(1, 'next'); }, reduce ? 0 : 380);
      });
    });
    /* Enter im Textfeld (außer Textarea) führt zum nächsten Schritt */
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && cur < steps.length - 1) { e.preventDefault(); next.click(); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(cur)) return;
      marks.forEach(function (m) { m.classList.add('is-done'); m.classList.remove('is-current'); });
      showDone(form);
    });
  } else if (form) {
    /* Einfaches Formular (Kontaktseite) */
    var checks = [
      ['f-name', function (el) { return el.value.trim().length > 1; }],
      ['f-mail', function (el) { return emailOk(el.value); }],
      ['f-msg', function (el) { return el.value.trim().length > 4; }],
      ['f-ok', function (el) { return el.checked; }]
    ];
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      checks.forEach(function (c) {
        var el = document.getElementById(c[0]);
        if (el && !markField(el, c[1](el)) && !firstBad) firstBad = el;
      });
      if (firstBad) { firstBad.focus(); return; }
      showDone(form);
    });
  }


  /* ---------- Team-Variante C: Foto wechselt mit dem Namen ---------- */
  var vcBtns = document.querySelectorAll('.vc__btn');
  if (vcBtns.length) {
    var vcSet = function (i) {
      document.querySelectorAll('.vc__img, .vc__cap').forEach(function (el) { el.classList.toggle('is-active', el.dataset.i === i); });
      vcBtns.forEach(function (b) { var on = b.dataset.i === i; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    };
    vcBtns.forEach(function (b) {
      b.addEventListener('click', function () { vcSet(b.dataset.i); });
      b.addEventListener('mouseenter', function () { vcSet(b.dataset.i); });
      b.addEventListener('focus', function () { vcSet(b.dataset.i); });
    });
  }

  /* ---------- Team-Variante D: Karussell ---------- */
  var vd = document.querySelector('.vd');
  if (vd) {
    var step = function (dir) {
      var card = vd.querySelector('.vd__card');
      var w = card ? card.getBoundingClientRect().width + 24 : 300;
      vd.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    };
    document.querySelector('.vd__prev').addEventListener('click', function () { step(-1); });
    document.querySelector('.vd__next').addEventListener('click', function () { step(1); });
    vd.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
