/**
 * Progressive station switcher for Pixel Pet RPG.
 * The server-rendered page is complete without this module: every place panel is
 * visible and every map label is a normal in-page anchor. This module only adds
 * an active-panel readout, aria-current, and the decorative player marker.
 */
const root = document.querySelector<HTMLElement>('[data-pxt-root]');

if (root) {
  const nodes = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-pxt-place-link]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-pxt-panel]'));
  const marker = root.querySelector<HTMLElement>('[data-pxt-player]');
  const now = root.querySelector<HTMLElement>('[data-pxt-now]');
  const liveTemplate = root.dataset.pxtLiveTemplate ?? '';

  const restore = () => {
    panels.forEach((panel) => {
      panel.hidden = false;
    });
    nodes.forEach((node) => node.removeAttribute('aria-current'));
    if (now) now.textContent = now.dataset.pxtHint ?? '';
    marker?.setAttribute('hidden', '');
    delete root.dataset.pxtReady;
    delete root.dataset.pxtActive;
  };

  const placeFromNode = (node: HTMLAnchorElement) =>
    node.getAttribute('href')?.replace(/^#/, '') ?? '';

  const activate = (place: string) => {
    const activeNode = nodes.find((node) => placeFromNode(node) === place);
    const activePanel = panels.find((panel) => panel.dataset.pxtPanel === place);
    if (!activeNode || !activePanel) return false;

    nodes.forEach((node) => {
      if (node === activeNode) node.setAttribute('aria-current', 'location');
      else node.removeAttribute('aria-current');
    });
    panels.forEach((panel) => {
      panel.hidden = panel !== activePanel;
    });

    if (marker) {
      marker.removeAttribute('hidden');
      activeNode.append(marker);
    }

    const label = activeNode.dataset.pxtLabel ?? activeNode.textContent?.trim() ?? '';
    if (now) now.textContent = liveTemplate.replace('{place}', label);
    root.dataset.pxtActive = place;
    return true;
  };

  const init = () => {
    try {
      if (nodes.length === 0 || panels.length === 0) return;
      const hashPlace = decodeURIComponent(location.hash.replace(/^#/, ''));
      const initial =
        nodes.find((node) => placeFromNode(node) === hashPlace)?.getAttribute('href')?.slice(1) ??
        'pxt-identity';
      if (!activate(initial)) return;
      root.dataset.pxtReady = 'true';

      root.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) return;
        const node = event.target.closest<HTMLAnchorElement>('[data-pxt-place-link]');
        if (!node || !root.contains(node)) return;
        try {
          if (!activate(placeFromNode(node))) restore();
        } catch {
          restore();
        }
      });

      window.addEventListener('hashchange', () => {
        try {
          const place = decodeURIComponent(location.hash.replace(/^#/, ''));
          if (!place) {
            if (!activate('pxt-identity')) restore();
            return;
          }
          if (!nodes.some((node) => placeFromNode(node) === place)) return;
          if (!activate(place)) restore();
        } catch {
          restore();
        }
      });
    } catch {
      restore();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}

export {};
