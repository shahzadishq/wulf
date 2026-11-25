(function () {
  var root = document.documentElement;
  root.classList.add('js');

  /* Schriftgröße – wird gemerkt */
  var buttons = document.querySelectorAll('.textsize button');
  function setSize(n) {
    root.setAttribute('data-size', n);
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.size === n)); });
    try { localStorage.setItem('wulf-size', n); } catch (e) {}
  }
  try { var saved = localStorage.getItem('wulf-size'); if (saved) setSize(saved); } catch (e) {}
  buttons.forEach(function (b) { b.addEventListener('click', function () { setSize(b.dataset.size); }); });

  /* Mobiles Menü */
  var toggle = document.querySelector('.navtoggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Schließen' : 'Menü';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && nav.classList.contains('is-open')) toggle.click();
    });
  }

  /* Die einzige Animation: Elbe-Karte zeichnen, sobald sichtbar */
  var map = document.querySelector('.hero__map');
  if (map) {
    var start = function () { map.classList.add('is-drawn'); };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { start(); io.disconnect(); }
      }, { threshold: 0.15 });
      io.observe(map);
    } else { start(); }
  }

  /* Fehlende Fotos: Initialen bleiben sichtbar */
  document.querySelectorAll('.person__photo img').forEach(function (img) {
    img.addEventListener('error', function () { img.remove(); });
  });

  /* Formular – Prüfung mit klaren Hinweisen */
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
        field.classList.toggle('has-error', !ok);
        var err = field.querySelector('.field__error');
        if (!ok) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', err.id); if (!firstBad) firstBad = el; }
        else { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }
      });
      if (firstBad) { firstBad.focus(); return; }
      /* TODO: an das bestehende WordPress-/Mail-Backend anbinden */
      Array.prototype.forEach.call(form.querySelectorAll('.field, button[type="submit"]'), function (n) { n.hidden = true; });
      var done = form.querySelector('.form__done');
      done.hidden = false;
      done.setAttribute('tabindex', '-1');
      done.focus();
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
