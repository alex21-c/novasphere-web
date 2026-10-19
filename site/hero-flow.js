// ===== HERO 3D FLOW =====
(function() {
  'use strict';
  let phase = 'laptop';
  const el = {
    section: document.getElementById('hero-3d'),
    stage: document.getElementById('deviceStage'),
    laptop: document.getElementById('laptop3d'),
    iphone: document.getElementById('iphone3d'),
    cta: document.getElementById('simulateShipment'),
    notif: document.getElementById('mobileNotif'),
    notifBar: document.getElementById('notifBar'),
    btnAccept: document.getElementById('btnAccept'),
    finger: document.getElementById('fingerTap'),
    routeCard: document.getElementById('routeCard'),
    canvas: document.getElementById('heroParticles')
  };

  function initParticles() {
    if (!el.canvas || typeof THREE === 'undefined') return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, el.canvas.clientWidth / el.canvas.clientHeight, 0.1, 1000);
    camera.position.z = 60;
    const renderer = new THREE.WebGLRenderer({ canvas: el.canvas, alpha: true, antialias: true });
    renderer.setSize(el.canvas.clientWidth, el.canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const n = 70;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      col[i * 3] = 59 / 255;
      col[i * 3 + 1] = 130 / 255;
      col[i * 3 + 2] = 246 / 255;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 1.3, vertexColors: true, transparent: true, opacity: 0.45 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    const lgeo = new THREE.BufferGeometry();
    const lpos = [];
    for (let i = 0; i < 40; i++) {
      const a = Math.floor(Math.random() * n);
      const b = Math.floor(Math.random() * n);
      lpos.push(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2]);
      lpos.push(pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]);
    }
    lgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lpos), 3));
    const lmat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.22 });
    scene.add(new THREE.LineSegments(lgeo, lmat));
    function animate() {
      requestAnimationFrame(animate);
      points.rotation.y += 0.001;
      points.rotation.x += 0.0005;
      renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
      camera.aspect = el.canvas.clientWidth / el.canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.canvas.clientWidth, el.canvas.clientHeight);
    });
  }

  function setPhase(next) {
    phase = next;
    document.body.classList.remove('laptop-phase', 'phone-phase', 'idle-phase');
    document.body.classList.add(next + '-phase');
    if (el.iphone) {
      el.iphone.classList.toggle('active', next !== 'laptop');
    }
  }

  function sendToLaptop(event) {
    const frame = window.__rapivoyReal && window.__rapivoyReal.demoFrame;
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ rapivoyDemo: event }, '*');
    }
  }

  function activateDeliveryDemoWhenReady(attempt) {
    if (typeof window.activateDeliveryDemo === 'function') {
      window.activateDeliveryDemo();
      return;
    }
    if (attempt >= 50) {
      console.error('[hero-flow] No se pudo iniciar la demostración del sistema de entrega.');
      return;
    }
    setTimeout(() => activateDeliveryDemoWhenReady(attempt + 1), 200);
  }
  let idleTimer = null;
  let phoneStartedForCycle = false;

  function startPhonePhase() {
    if (phase !== 'laptop' || phoneStartedForCycle) return;
    phoneStartedForCycle = true;
    setPhase('phone');
    startPhoneTourWhenReady(0);
  }

  function startPhoneTourWhenReady(attempt) {
    if (window.rapivoyModels && window.rapivoyModels.startPhoneTour) {
      window.rapivoyModels.startPhoneTour();
      return;
    }
    if (attempt >= 50) {
      console.error('[hero-flow] No se pudo iniciar la demostración del teléfono.');
      return;
    }
    setTimeout(() => startPhoneTourWhenReady(attempt + 1), 200);
  }

  function coordinateTours() {
    window.addEventListener('message', (event) => {
      const forwarded = event.data && event.data.__reroute
        ? event.data.data
        : event.data;
      const message = typeof forwarded === 'string'
        ? { rapivoyDemo: forwarded }
        : forwarded;
      if (!message || typeof message !== 'object') return;

      if (message.rapivoyDemo === 'laptop-tour-complete') {
        startPhonePhase();
      } else if (message.rapivoyDemo === 'phone-tour-complete') {
        setPhase('idle');
        sendToLaptop('show-laptop-login');
      } else if (message.rapivoyDemo === 'phone-login-ready') {
        if (idleTimer) clearTimeout(idleTimer);
        setPhase('idle');
        idleTimer = setTimeout(() => {
          idleTimer = null;
          sendToLaptop('restart-laptop-tour');
          const phoneApp = document.querySelector('.phone-screen-app');
          if (phoneApp && phoneApp.contentWindow) {
            phoneApp.contentWindow.postMessage(
              { rapivoyDemo: 'resume-phone-login' },
              '*'
            );
          }
          phoneStartedForCycle = false;
          setPhase('laptop');
        }, 20000);
      }
    });
  }

  function checkIframeLoad() {
    if (!el.laptop) return;
    const iframe = document.getElementById('laptopWebView');
    const fallback = document.getElementById('laptopFallback');
    if (!iframe || !fallback) return;
    let checked = false;
    const timeout = setTimeout(() => {
      if (!checked) {
        checked = true;
        showFallback();
      }
    }, 5000);
    iframe.onload = () => {
      checked = true;
      clearTimeout(timeout);
      if (fallback) fallback.classList.add('hidden');
    };
    iframe.onerror = () => {
      checked = true;
      clearTimeout(timeout);
      showFallback();
    };
  }

  function showFallback() {
    const fallback = document.getElementById('laptopFallback');
    const iframe = document.getElementById('laptopWebView');
    if (fallback) fallback.classList.remove('hidden');
    if (iframe) iframe.style.display = 'none';
  }

  function startTransition() {
    if (phase !== 'laptop') return;
    phase = 'transition';
    if (el.cta) { el.cta.style.opacity = '0'; el.cta.style.pointerEvents = 'none'; }
    if (el.laptop) el.laptop.classList.add('compact');
    if (el.iphone) { el.iphone.classList.add('active'); if (el.routeCard) el.routeCard.classList.add('visible'); }
    phase = 'phone';
    setTimeout(showMobileNotification, 1200);
  }

  function showMobileNotification() {
    if (el.notif) el.notif.classList.add('show');
    setTimeout(() => {
      if (el.notifBar) el.notifBar.classList.add('filled');
      showFingerTap();
    }, 600);
  }

  function showFingerTap() {
    if (!el.finger || !el.btnAccept || !el.stage) return;
    const sr = el.stage.getBoundingClientRect();
    const r = el.btnAccept.getBoundingClientRect();
    const ir = el.iphone.getBoundingClientRect();
    el.finger.style.left = (r.left + r.width / 2 - ir.left - sr.left) + 'px';
    el.finger.style.top = (r.top + r.height / 2 - ir.top - sr.top - 8) + 'px';
    el.finger.classList.add('active');
    setTimeout(() => {
      el.finger.classList.remove('active');
      acceptRoute();
    }, 400);
  }

  function acceptRoute() {
    if (!el.btnAccept) return;
    el.btnAccept.classList.add('accepted');
    el.btnAccept.textContent = 'Ruta Aceptada ✓';
  }

  function init() {
    if (document.body.classList.contains('iphone-only')) return;
    initParticles();
    setPhase('laptop');
    coordinateTours();
    document.querySelectorAll('a[href="#sistema-entrega"], a[href="#hero-3d"]').forEach((link) => {
      link.addEventListener('click', () => {
        setTimeout(() => activateDeliveryDemoWhenReady(0), 300);
      });
    });
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activateDeliveryDemoWhenReady(0);
      });
    }, { threshold: 0.15 }).observe(el.section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
  window.rapivoyHero3d = { startTransition };
})();