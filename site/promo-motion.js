(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const usesAiSubpageTheme = document.body.matches('.system-page, .work-page');

  if (usesAiSubpageTheme) {
    // These pages use the same dark AI visual system as the NovaSphere landing page.
    // Load the theme after their legacy inline styles so it can override the old palette.
    if (!document.querySelector('link[href*="ai-subpages.css"]')) {
      const aiThemeLink = document.createElement('link');
      aiThemeLink.rel = 'stylesheet';
      aiThemeLink.href = 'ai-subpages.css?v=20261111';
      document.head.appendChild(aiThemeLink);
    }
  } else {
    // Keep the existing seasonal theme on pages that have not moved to the AI design.
    document.body.classList.add('christmas-theme');
    if (!document.querySelector('link[href="christmas.css"]')) {
      const themeLink = document.createElement('link');
      themeLink.rel = 'stylesheet';
      themeLink.href = 'christmas.css';
      document.head.appendChild(themeLink);
    }
    if (!document.querySelector('link[href="nav-island.css"]')) {
      const islandLink = document.createElement('link');
      islandLink.rel = 'stylesheet';
      islandLink.href = 'nav-island.css';
      document.head.appendChild(islandLink);
    }
  }

  if (prefersReducedMotion.matches) return;

  const revealTargets = document.querySelectorAll([
    '.developer-hero .hero-content > *',
    '.developer-values > *',
    '.delivery-spotlight',
    '.home-section-heading',
    '.about-panel',
    '.services-grid > *',
    '.outcomes-grid > *',
    '.visual-style-grid > *',
    '.design-options > *',
    '.pricing-panel',
    '.home-cta',
    '.section-header',
    '.tech-grid > *',
    '.steps-grid > *',
    '.system-details-heading',
    '.system-benefits > *',
    '.system-capabilities > *',
    '.system-investment',
    '.system-contact',
    '.work-hero-content',
    '.work-intro',
    '.work-grid > *',
    '.work-design-heading',
    '.design-showcase > *',
    '.design-details > *',
    '.process-heading',
    '.process-grid > *',
    '.work-principles > *',
    '.project-cost-note',
    '.purchase-contact'
  ].join(','));

  if (!revealTargets.length) return;

  revealTargets.forEach((element, index) => {
    element.setAttribute('data-reveal', '');
    element.style.setProperty('--reveal-delay', `${(index % 4) * 90}ms`);
  });

  document.documentElement.classList.add('promo-motion-ready');

  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  revealTargets.forEach((element) => observer.observe(element));
})();
