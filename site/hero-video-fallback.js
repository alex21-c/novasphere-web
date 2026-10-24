// ===== VIDEO FALLBACK LIGERO PARA DISPOSITIVOS DE BAJOS RECURSOS =====
(function () {
  'use strict';
  function isLowEnd() {
    try {
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn && conn.saveData) return true;
      if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4) return true;
      if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) return true;
    } catch (e) {}
    return false;
  }
  function isMobile() {
    return window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  }
  function showVideo() {
    var wrap = document.getElementById('demoVideoWrap');
    if (!wrap) return;
    wrap.hidden = false;
    wrap.style.display = 'block';
    var video = document.getElementById('demoVideo');
    if (video) { try { video.play(); } catch (e) {} }
    // Cargar el demo en el iframe de la laptop por si el usuario cambia al modo 3D
    if (typeof window.activateDeliveryDemo === 'function') {
      window.activateDeliveryDemo();
    }
    // ocultar 3D pesado
    ['.hero-real3d', '#laptop3d', '#iphone3d', '#iphoneRealWrap', '#realLaptopWrap'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { el.style.display = 'none'; });
    });
    document.body.classList.add('video-mode');
    var stage = document.getElementById('deviceStage');
    if (stage) stage.classList.add('video-mode');
  }
  function show3D() {
    var wrap = document.getElementById('demoVideoWrap');
    if (wrap) { wrap.hidden = true; wrap.style.display = 'none'; }
    var video = document.getElementById('demoVideo');
    if (video) { try { video.pause(); } catch (e) {} }
    ['.hero-real3d', '#laptop3d', '#iphone3d'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { el.style.display = ''; });
    });
    document.body.classList.remove('video-mode');
    var stage = document.getElementById('deviceStage');
    if (stage) stage.classList.remove('video-mode');
  }
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('toggleDemoVideo');
    if (btn) {
      btn.addEventListener('click', function () {
        var wrap = document.getElementById('demoVideoWrap');
        if (wrap && wrap.hidden) showVideo(); else show3D();
      });
    }
    if (isLowEnd() || isMobile()) showVideo();
  });
})();
