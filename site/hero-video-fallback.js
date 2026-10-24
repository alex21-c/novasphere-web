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

  // ---- Carrusel de fotos dentro de la laptop ----
  var photoIndex = 0;
  var photoTotal = 4;

  function updatePhotoCarousel() {
    var items = document.querySelectorAll('#laptopPhotos .laptop-photo-item');
    var counter = document.querySelector('#laptopPhotos .laptop-photo-counter');
    items.forEach(function (item, i) {
      item.classList.toggle('active', i === photoIndex);
    });
    if (counter) counter.textContent = (photoIndex + 1) + ' / ' + photoTotal;
  }

  function nextPhoto() {
    photoIndex = (photoIndex + 1) % photoTotal;
    updatePhotoCarousel();
  }
  function prevPhoto() {
    photoIndex = (photoIndex - 1 + photoTotal) % photoTotal;
    updatePhotoCarousel();
  }

  function showVideo() {
    var wrap = document.getElementById('demoVideoWrap');
    if (!wrap) return;
    wrap.hidden = true;
    wrap.style.display = 'none';
    var video = document.getElementById('demoVideo');
    if (video) { try { video.pause(); } catch (e) {} }

    // Forzar que la laptop CSS y sus fotos sean visibles (el 3D puede haberla ocultado con .loaded)
    var lap = document.getElementById('laptop3d');
    if (lap) lap.style.display = 'block';
    var hr = document.querySelector('.hero-real3d');
    if (hr) hr.classList.remove('loaded');

    // Mostrar las fotos del sistema dentro de la pantalla de la laptop
    var photos = document.getElementById('laptopPhotos');
    if (photos) { photos.classList.remove('hidden'); photos.style.display = 'block'; }

    // Reiniciar carrusel a la primera foto
    photoIndex = 0;
    updatePhotoCarousel();

    // Ocultar el iframe interactivo mientras se ven las fotos
    var iframe = document.getElementById('laptopWebView');
    if (iframe) iframe.style.display = 'none';

    // ocultar solo el 3D pesado (Three.js), NO el mockup CSS de la laptop (#laptop3d)
    ['.hero-real3d', '#iphoneRealWrap', '#realLaptopWrap'].forEach(function (sel) {
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

    // Ocultar las fotos y mostrar el iframe interactivo
    var photos = document.getElementById('laptopPhotos');
    if (photos) { photos.classList.add('hidden'); photos.style.display = 'none'; }
    var iframe = document.getElementById('laptopWebView');
    if (iframe) iframe.style.display = 'block';

    ['.hero-real3d', '#laptop3d', '#iphone3d'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { el.style.display = ''; });
    });
    document.body.classList.remove('video-mode');
    var stage = document.getElementById('deviceStage');
    if (stage) stage.classList.remove('video-mode');
  }
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('toggleDemoVideo');
    var showingPhotos = false;
    if (btn) {
      btn.addEventListener('click', function () {
        showingPhotos = !showingPhotos;
        if (showingPhotos) showVideo(); else show3D();
      });
    }
    // Navegación del carrusel de fotos (delegación para evitar problemas si el DOM cambia)
    document.addEventListener('click', function (e) {
      if (!showingPhotos) return;
      var target = e.target;
      var nav = target.closest('.laptop-photo-nav');
      if (!nav) return;
      e.preventDefault();
      if (nav.classList.contains('next')) nextPhoto();
      if (nav.classList.contains('prev')) prevPhoto();
    });
    if (isLowEnd() || isMobile()) { showVideo(); showingPhotos = true; }
  });
})();
