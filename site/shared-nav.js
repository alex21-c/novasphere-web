(() => {
  const page = document.body;
  if (!page || !page.matches('.home-page, .system-page, .work-page')) return;

  const existingHeader = document.querySelector('.navbar');
  const activePage = page.classList.contains('system-page')
    ? 'delivery'
    : page.classList.contains('work-page')
      ? 'work'
      : 'home';

  const stylesheet = document.createElement('style');
  stylesheet.id = 'novasphere-shared-nav-styles';
  stylesheet.textContent = `
    .ns-nav, .ns-nav * { box-sizing: border-box; }
    .ns-nav {
      position: sticky !important;
      top: 14px !important;
      z-index: 1000 !important;
      width: min(1180px, calc(100% - 48px)) !important;
      min-height: 74px !important;
      margin: 14px auto 0 !important;
      padding: 12px 18px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 20px !important;
      border: 1px solid rgba(177,190,228,.16) !important;
      border-radius: 22px !important;
      background: rgba(8,12,23,.82) !important;
      box-shadow: 0 14px 40px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.04) !important;
      -webkit-backdrop-filter: blur(20px) saturate(140%) !important;
      backdrop-filter: blur(20px) saturate(140%) !important;
      font-family: 'DM Sans', Inter, sans-serif !important;
    }
    .ns-nav a { text-decoration: none !important; }
    .ns-brand {
      display: inline-flex !important;
      flex: 0 0 auto !important;
      align-items: center !important;
      gap: 10px !important;
      color: #f4f6ff !important;
      font: 700 18px/1 'Space Grotesk', sans-serif !important;
      letter-spacing: -.5px !important;
      white-space: nowrap !important;
    }
    .ns-mark {
      width: 36px !important;
      height: 36px !important;
      display: grid !important;
      place-items: center !important;
      border-radius: 12px !important;
      color: #070b16 !important;
      background: linear-gradient(135deg,#a796ff,#73d9ed) !important;
      box-shadow: 0 0 24px rgba(153,135,255,.27) !important;
      font: 700 18px/1 'Space Grotesk', sans-serif !important;
    }
    .ns-links {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      margin: 0 auto !important;
      padding: 5px !important;
      border: 1px solid rgba(177,190,228,.1) !important;
      border-radius: 999px !important;
      background: rgba(255,255,255,.025) !important;
    }
    .ns-links a {
      position: relative !important;
      display: inline-flex !important;
      align-items: center !important;
      min-height: 40px !important;
      padding: 0 14px !important;
      border: 1px solid transparent !important;
      border-radius: 999px !important;
      color: #aab4ca !important;
      font: 500 13px/1.2 'DM Sans', Inter, sans-serif !important;
      white-space: nowrap !important;
      transition: color .2s ease, background .2s ease, border-color .2s ease, transform .2s ease !important;
    }
    .ns-links a:hover { color: #fff !important; transform: translateY(-1px) !important; }
    .ns-links a[aria-current='page'] {
      color: #f7f6ff !important;
      border-color: rgba(153,135,255,.21) !important;
      background: linear-gradient(110deg,rgba(153,135,255,.17),rgba(115,217,237,.09)) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.05) !important;
    }
    .ns-links a::after { display: none !important; }
    .ns-contact {
      display: inline-flex !important;
      flex: 0 0 auto !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 9px !important;
      min-height: 42px !important;
      padding: 0 16px !important;
      border: 1px solid rgba(153,135,255,.3) !important;
      border-radius: 999px !important;
      color: #f8f7ff !important;
      background: linear-gradient(110deg,rgba(153,135,255,.17),rgba(115,217,237,.13)) !important;
      font: 700 13px/1 'DM Sans', Inter, sans-serif !important;
      white-space: nowrap !important;
      transition: transform .2s ease, box-shadow .2s ease !important;
    }
    .ns-contact:hover { transform: translateY(-2px) !important; box-shadow: 0 10px 24px rgba(115,217,237,.15) !important; }
    .ns-menu-toggle {
      display: none !important;
      width: 42px !important;
      height: 42px !important;
      padding: 0 !important;
      flex: 0 0 auto !important;
      border: 1px solid rgba(177,190,228,.17) !important;
      border-radius: 13px !important;
      background: rgba(255,255,255,.04) !important;
      color: #f4f6ff !important;
      cursor: pointer !important;
    }
    .ns-menu-toggle span { display:block !important; width:17px !important; height:2px !important; margin:4px auto !important; border-radius:3px !important; background:currentColor !important; transition:transform .2s ease !important; }
    .ns-menu-toggle[aria-expanded='true'] span:first-child { transform:translateY(3px) rotate(45deg) !important; }
    .ns-menu-toggle[aria-expanded='true'] span:last-child { transform:translateY(-3px) rotate(-45deg) !important; }
    @media (max-width: 860px) {
      .ns-nav { width:calc(100% - 28px) !important; min-height:66px !important; padding:10px 12px !important; gap:10px !important; }
      .ns-menu-toggle { display:block !important; order:3 !important; }
      .ns-contact { margin-left:auto !important; }
      .ns-links {
        position:absolute !important;
        top:calc(100% + 10px) !important;
        left:0 !important;
        right:0 !important;
        display:none !important;
        align-items:stretch !important;
        flex-direction:column !important;
        gap:5px !important;
        margin:0 !important;
        padding:10px !important;
        border:1px solid rgba(177,190,228,.17) !important;
        border-radius:18px !important;
        background:rgba(9,14,26,.97) !important;
        box-shadow:0 20px 44px rgba(0,0,0,.35) !important;
        -webkit-backdrop-filter:blur(20px) !important;
        backdrop-filter:blur(20px) !important;
      }
      .ns-links.is-open { display:flex !important; }
      .ns-links a { min-height:46px !important; justify-content:flex-start !important; padding:0 14px !important; }
    }
    @media (max-width: 440px) {
      .ns-nav { width:calc(100% - 20px) !important; padding:9px !important; }
      .ns-brand { gap:7px !important; font-size:16px !important; }
      .ns-mark { width:32px !important; height:32px !important; }
      .ns-contact { min-height:39px !important; padding:0 11px !important; font-size:12px !important; }
      .ns-menu-toggle { width:39px !important; height:39px !important; }
    }
    @media (prefers-reduced-motion: reduce) {
      .ns-nav *, .ns-nav *::before, .ns-nav *::after { transition-duration:.01ms !important; }
    }
  `;
  document.head.appendChild(stylesheet);

  const header = document.createElement('header');
  header.className = 'ns-nav';
  header.innerHTML = `
    <a class="ns-brand" href="index.html" aria-label="NovaSphere, inicio">
      <span class="ns-mark" aria-hidden="true">N</span>
      <span>NovaSphere</span>
    </a>
    <nav class="ns-links" id="ns-main-links" aria-label="Navegación principal">
      <a href="index.html" ${activePage === 'home' ? 'aria-current="page"' : ''}>Inicio</a>
      <a href="sistema-entrega.html" ${activePage === 'delivery' ? 'aria-current="page"' : ''}>Sistema de entrega</a>
      <a href="nuestra-forma-de-trabajar.html" ${activePage === 'work' ? 'aria-current="page"' : ''}>Nuestra forma de trabajar</a>
    </nav>
    <a class="ns-contact" href="mailto:alexandrescruz7@gmail.com?subject=Hablemos%20de%20mi%20proyecto">Hablemos <span aria-hidden="true">↗</span></a>
    <button class="ns-menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="ns-main-links"><span></span><span></span></button>
  `;

  if (existingHeader) existingHeader.replaceWith(header);
  else page.prepend(header);

  const toggle = header.querySelector('.ns-menu-toggle');
  const nav = header.querySelector('.ns-links');
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.setAttribute('aria-label', expanded ? 'Abrir menú' : 'Cerrar menú');
    nav.classList.toggle('is-open', !expanded);
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    });
  });
})();
