// ===== HERO MODELS — visor GLB real con fallback CSS =====
(function () {
  'use strict';
  const LAPTOP_GLB = ['assets/laptop.glb', 'assets/laptop1.glb'];
  const IPHONE_GLB = ['assets/iphone.glb', 'assets/Iphone_13_ProMax.glb'];

  function headOk(url) {
    return fetch(url, { method: 'HEAD' }).then(r => r.ok).catch(() => false);
  }
  async function firstExisting(list) {
    for (const u of list) {
      const ok = await headOk(u);
      if (ok) return u;
    }
    return null;
  }
  function mountModelViewer(container, glbUrl, alt) {
    if (!customElements.get('model-viewer')) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
      document.head.appendChild(s);
    }
    container.innerHTML = '';
    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', glbUrl);
    mv.setAttribute('alt', alt);
    mv.setAttribute('shadow-intensity', '0.25');
    mv.setAttribute('loading', 'lazy');
    mv.setAttribute('exposure', '1.1');
    mv.setAttribute('camera-orbit', '0deg 78deg auto');
    mv.setAttribute('interaction-prompt', 'none');
    mv.setAttribute('disable-zoom', '');
    const screen = document.createElement('div');
    screen.className = 'phone-screen-hotspot';
    screen.slot = 'hotspot-screen';
    screen.setAttribute('data-position', '0.0025 0.0695 0.0038');
    screen.setAttribute('data-normal', '0 0 1');

    const app = document.createElement('iframe');
    app.className = 'phone-screen-app';
    app.title = 'App Personalizable en modo demo';
    app.setAttribute('data-src', 'app-flutter/index.html?demo=1&build=20261018g');
    app.setAttribute('allow', 'autoplay; fullscreen');
    app.setAttribute('loading', 'lazy');
    screen.appendChild(app);
    mv.appendChild(screen);

    const startPhoneTour = function () {
      const src = app.getAttribute('data-src');
      if (!src) return;
      app.removeAttribute('data-src');
      app.src = src;
    };
    window.rapivoyModels = {
      iphoneGlb: glbUrl,
      iw: container,
      startPhoneTour
    };
    window.addEventListener('message', function (event) {
      const message = event.data && event.data.__reroute
        ? event.data.data
        : event.data;
      if (message && message.rapivoyDemo === 'show-phone-tour') {
        startPhoneTour();
      }
    });
    window.rapivoyPhoneApp = app;

    mv.style.width = '100%';
    mv.style.height = '100%';
    mv.style.background = 'transparent';
    container.appendChild(mv);
    container.classList.add('visible');
    const ajustarPantalla = function () {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width < 40 || height < 40) return;
      screen.style.width = Math.round(width * 0.76) + 'px';
      screen.style.height = Math.round(height * 0.9) + 'px';
    };
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(ajustarPantalla).observe(container);
    } else {
      window.addEventListener('resize', ajustarPantalla);
    }
    requestAnimationFrame(ajustarPantalla);
    if (document.body.classList.contains('phone-phase')) {
      startPhoneTour();
    }
    return mv;
  }
  function showBanner(laptopOk, iphoneOk) {
    if (laptopOk && iphoneOk) return;
    if (document.getElementById('convertBanner')) return;
    const stage = document.getElementById('deviceStage');
    if (!stage) return;
    const b = document.createElement('div');
    b.id = 'convertBanner';
    b.className = 'convert-banner';
    const miss = [];
    if (!laptopOk) miss.push('<code>assets/laptop.glb</code> (de <code>laptop.blend</code>)');
    if (!iphoneOk) miss.push('<code>assets/iphone.glb</code> (de <code>Iphone_13_ProMax.max</code>)');
    b.innerHTML = 'Mostrando mockup temporal. Para tu modelo 3D real exporta: ' +
      miss.join(' y ') + '<br/>Blender: <code>Archivo - Exportar - glTF 2.0 (.glb)</code>' +
      ' o: <code>blender --background --python export-blend-to-glb.py -- assets/laptop.blend assets/laptop.glb</code>';
    stage.parentNode.insertBefore(b, stage.nextSibling);
  }
  async function init() {
    const stage = document.getElementById('deviceStage');
    const iphoneCss = document.getElementById('iphone3d');
    if (!stage || !iphoneCss) return;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.saveData) return;
    const iphoneGlb = await firstExisting(IPHONE_GLB);
    // La laptop real la maneja hero-real3d.js (Three.js + web viva en pantalla).
    // Aquí solo se gestiona el iPhone para no duplicar visores ni descargas.
    let iw = document.getElementById('iphoneRealWrap');
    if (!iw) {
      iw = document.createElement('div');
      iw.id = 'iphoneRealWrap';
      iw.className = 'model3d-wrap iphone-wrap';
      iphoneCss.parentNode.insertBefore(iw, iphoneCss.nextSibling);
    }
    if (iphoneGlb) {
      mountModelViewer(iw, iphoneGlb, 'iPhone Rapivoy 3D');
      iphoneCss.classList.add('has-real-model');
    }
    showBanner(true, !!iphoneGlb);
    if (!iphoneGlb) {
      window.rapivoyModels = {
        iphoneGlb,
        iw,
        startPhoneTour: function () {
          console.error('[hero-models] No se encontró el modelo 3D del iPhone.');
        }
      };
    }
  }
  function initWhenNearDemo() {
    const stage = document.getElementById('deviceStage');
    if (!stage || typeof IntersectionObserver !== 'function') {
      init();
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      init();
    }, { rootMargin: '300px 0px' });
    observer.observe(stage);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenNearDemo, { once: true });
  } else { initWhenNearDemo(); }
})();
