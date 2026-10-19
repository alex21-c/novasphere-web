// ===== DEMO AUTOMÁTICA: maneja la app REAL (promo/app) dentro de un iframe =====
(function () {
  'use strict';
  var USER = 'alex';
  var PASS = '123';
  var frame = document.getElementById('app');
  var cursor = document.getElementById('cursor');
  var ripple = document.getElementById('ripple');
  var capText = document.getElementById('capText');
  var dots = document.querySelectorAll('#dots span');
  var fade = document.getElementById('fade');
  var laptopLogin = document.getElementById('laptopLogin');
  var cx = -100, cy = -100;
  var restartLaptop = null;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  window.addEventListener('message', function (event) {
    var message = event.data;
    if (!message || typeof message !== 'object') return;
    if (message.rapivoyDemo === 'show-laptop-login') {
      laptopLogin.hidden = false;
    } else if (message.rapivoyDemo === 'restart-laptop-tour') {
      laptopLogin.hidden = true;
      if (restartLaptop) {
        restartLaptop();
        restartLaptop = null;
      }
    }
  });
  function waitForLaptopRestart() {
    return new Promise(function (resolve) { restartLaptop = resolve; });
  }
  function caption(step, text) {
    capText.style.opacity = 0;
    setTimeout(function () { capText.textContent = text; capText.style.opacity = 1; }, 220);
    for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('on', i <= step);
  }
  function doc() { return frame.contentDocument; }
  function win() { return frame.contentWindow; }

  function waitFor(fn, timeout) {
    var t0 = Date.now();
    timeout = timeout || 40000;
    return new Promise(function (resolve, reject) {
      (function poll() {
        var v = null;
        try { v = fn(); } catch (e) { v = null; }
        if (v) return resolve(v);
        if (Date.now() - t0 > timeout) return reject(new Error('timeout'));
        setTimeout(poll, 150);
      })();
    });
  }
  function byText(sel, re) {
    var list = doc().querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) if (re.test(list[i].textContent || '')) return list[i];
    return null;
  }
  function moveTo(el, fx, fy) {
    var r = el.getBoundingClientRect();
    cx = r.left + r.width * (fx == null ? 0.5 : fx);
    cy = r.top + r.height * (fy == null ? 0.5 : fy);
    cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    return sleep(950);
  }
  function click(el) {
    ripple.style.left = cx + 'px';
    ripple.style.top = cy + 'px';
    ripple.classList.remove('go');
    void ripple.offsetWidth;
    ripple.classList.add('go');
    el.click();
    return sleep(350);
  }
  function setValue(input, value) {
    var proto = win().HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, value);
    input.dispatchEvent(new (win().Event)('input', { bubbles: true }));
  }
  async function typeInto(input, text) {
    input.focus();
    var acc = '';
    for (var i = 0; i < text.length; i++) {
      acc += text[i];
      setValue(input, acc);
      await sleep(190);
    }
  }
  function scrollDoc(y, ms) {
    try { win().scrollTo({ top: y, behavior: 'smooth' }); } catch (e) {}
    return sleep(ms || 1200);
  }
  async function scrollShow() {
    await sleep(1200);
    await scrollDoc(380, 1700);
    await scrollDoc(0, 1400);
  }

  async function run() {
    fade.classList.remove('on');
    cursor.style.transform = 'translate(-100px,-100px)';
    try { parent.postMessage({ rapivoyDemo: 'start' }, '*'); } catch (e) {}
    caption(0, '1 · Inicio — arranca el sistema');
    await new Promise(function (res) {
      frame.onload = res;
      frame.src = 'app/index.html?demo=' + Date.now();
    });

    // 1. INICIO (pantalla de arranque real)
    var skip = await waitFor(function () { return byText('button', /Omitir e ingresar/i); });
    await sleep(3200);
    await moveTo(skip);
    await click(skip);

    // 2. LOGIN que se rellena solo
    caption(1, '2 · Login — se rellena automáticamente');
    var inputs = await waitFor(function () {
      var f = [];
      var all = doc().querySelectorAll('form input');
      for (var i = 0; i < all.length; i++) {
        var t = (all[i].getAttribute('type') || 'text').toLowerCase();
        if (t === 'text' || t === 'email' || t === 'password') f.push(all[i]);
      }
      return f.length >= 2 ? f : null;
    });
    await sleep(900);
    await moveTo(inputs[0]);
    await click(inputs[0]);
    await typeInto(inputs[0], USER);
    await sleep(350);
    await moveTo(inputs[1]);
    await click(inputs[1]);
    await typeInto(inputs[1], PASS);
    await sleep(500);
    var submit = doc().querySelector('form button[type="submit"]');
    await moveTo(submit);
    await click(submit);

    // 3. DASHBOARD
    var navDash = await waitFor(function () { return doc().querySelector('header nav button[title="Dashboard"]'); });
    caption(2, '3 · Dashboard — métricas y flota en tiempo real');
    await sleep(1400);
    await scrollShow();

    // 4. BASE DE GUÍAS
    var navGuias = doc().querySelector('header nav button[title="Base de Guías"]');
    await moveTo(navGuias);
    caption(3, '4 · Base de guías — todos los envíos');
    await click(navGuias);
    await scrollShow();

    // 5. GESTIÓN DE MENSAJEROS
    var navMsj = doc().querySelector('header nav button[title="Mensajeros"]');
    await moveTo(navMsj);
    caption(4, '5 · Gestión de mensajeros');
    await click(navMsj);
    await scrollShow();

    // Volver al Dashboard y esperar el cierre del recorrido del teléfono.
    await moveTo(navDash);
    await click(navDash);
    await sleep(1800);
    fade.classList.add('on');
    try { parent.postMessage({ rapivoyDemo: 'laptop-tour-complete' }, '*'); } catch (e) {}
    await waitForLaptopRestart();
  }

  (async function loop() {
    for (;;) {
      try {
        await run();
      } catch (e) {
        console.error('[demo-laptop] No se pudo completar el recorrido:', e);
        await sleep(1500);
      }
    }
  })();
})();
