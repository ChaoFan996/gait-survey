/* Public widget identifier supplied by the site owner; it is not an API secret. */
(() => {
  'use strict';
  const panel = document.getElementById('visitor-map');
  const embed = document.getElementById('visitor-map-embed');
  if (!panel || !embed) return;

  // Local previews and repository forks must not contribute to the live counter.
  const production = location.hostname === 'chaofan996.github.io'
    && /^\/gait-survey(?:\/|$)/.test(location.pathname);
  if (!production) return;

  const script = document.createElement('script');
  script.id = 'mapmyvisitors';
  script.async = true;
  script.src = 'https://mapmyvisitors.com/map.js?d=ZXgoJmIvbz7lwMPnNBsEgjsoUHvdAXKsaAT4K2mM4Ro&cl=d9e3f2&co=ffffff&ct=68768a&w=a';
  script.addEventListener('error', () => {
    panel.hidden = true;
    document.querySelector('.masthead-inner').classList.remove('has-visitor-map');
  });

  // Keep the provider's interactive map and attribution, and open its details
  // separately so exploring visitor statistics does not leave the collection.
  const observer = new MutationObserver(() => {
    const link = embed.querySelector('#mapmyvisitors-widget');
    if (link) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });
  observer.observe(embed, {childList: true, subtree: true});
  panel.hidden = false;
  document.querySelector('.masthead-inner').classList.add('has-visitor-map');
  embed.appendChild(script);
})();
