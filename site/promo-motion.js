(() => {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) return;

  const revealTargets = document.querySelectorAll([
    '.developer-values > *',
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
