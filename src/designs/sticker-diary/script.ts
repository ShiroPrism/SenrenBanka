/**
 * Sticker Diary spread transport.
 *
 * The complete long document is the server-rendered default. This module only
 * changes which already-rendered spread is visible after every required node has
 * been found. Any setup failure restores the long document instead of leaving a
 * partially hidden page.
 */

type Direction = 'next' | 'previous' | 'jump';

const root = document.querySelector<HTMLElement>('[data-sd-root]');

if (root) {
  const spreads = Array.from(
    root.querySelectorAll<HTMLElement>('[data-sd-spread]'),
  );
  const tabs = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-sd-tab]'));
  const previous = root.querySelector<HTMLButtonElement>('[data-sd-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-sd-next]');
  const controls = root.querySelector<HTMLElement>('[data-sd-controls]');
  const status = root.querySelector<HTMLElement>('[data-sd-status]');
  const statusTemplate = status?.dataset.sdStatusTemplate;

  let activeIndex = 0;

  const restoreLongDocument = () => {
    root.removeAttribute('data-sd-ready');
    root.removeAttribute('data-sd-direction');
    if (controls) controls.hidden = true;
    spreads.forEach((spread) => {
      spread.hidden = false;
      spread.removeAttribute('data-sd-active');
    });
    tabs.forEach((tab) => {
      tab.removeAttribute('aria-current');
      tab.removeAttribute('aria-expanded');
    });
    if (previous) previous.disabled = false;
    if (next) next.disabled = false;
  };

  try {
    if (spreads.length === 0) throw new Error('No spreads found');
    if (spreads.length !== tabs.length) throw new Error('Spread and tab counts differ');
    if (!previous || !next || !controls || !status || !statusTemplate) {
      throw new Error('Spread transport is incomplete');
    }

    const spreadIndex = new Map(
      spreads.map((spread, index) => [spread.id, index] as const),
    );

    const goTo = (
      requestedIndex: number,
      direction: Direction,
      moveFocus: boolean,
      updateHash = true,
    ) => {
      const targetIndex = Math.max(
        0,
        Math.min(spreads.length - 1, requestedIndex),
      );

      spreads.forEach((spread, index) => {
        const isCurrent = index === targetIndex;
        spread.hidden = !isCurrent;
        spread.toggleAttribute('data-sd-active', isCurrent);
      });

      tabs.forEach((tab, index) => {
        if (index === targetIndex) {
          tab.setAttribute('aria-current', 'page');
          tab.setAttribute('aria-expanded', 'true');
        } else {
          tab.removeAttribute('aria-current');
          tab.setAttribute('aria-expanded', 'false');
        }
      });

      const label = tabs[targetIndex]?.dataset.sdLabel?.trim();
      if (!label) throw new Error('Spread label is missing');

      status.textContent = statusTemplate
        .replaceAll('{n}', String(targetIndex + 1))
        .replaceAll('{total}', String(spreads.length))
        .replaceAll('{label}', label);

      root.dataset.sdDirection = direction;
      previous.disabled = targetIndex === 0;
      next.disabled = targetIndex === spreads.length - 1;
      activeIndex = targetIndex;

      if (updateHash) {
        history.replaceState(null, '', `#${spreads[targetIndex].id}`);
      }

      if (moveFocus) {
        const focusTarget =
          spreads[targetIndex].querySelector<HTMLElement>('[data-sd-focus]');
        if (focusTarget) {
          focusTarget.focus({ preventScroll: true });
          focusTarget.scrollIntoView({ block: 'start' });
        }
      }
    };

    const hashIndex = spreadIndex.get(location.hash.slice(1));
    goTo(hashIndex ?? 0, 'jump', false, false);
    root.setAttribute('data-sd-ready', '');
    controls.hidden = false;

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        goTo(index, 'jump', false);
      });
    });

    previous.addEventListener('click', () => {
      goTo(activeIndex - 1, 'previous', true);
    });

    next.addEventListener('click', () => {
      goTo(activeIndex + 1, 'next', true);
    });

    document.addEventListener('keydown', (event) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
      ) {
        return;
      }

      const blocked =
        'input, textarea, select, [contenteditable="true"], [role="dialog"], .cm, .cm-sheet, .cm-launcher, .cm-scrim';
      const target = event.target;
      const focused = document.activeElement;

      if (
        (target instanceof Element && target.closest(blocked)) ||
        (focused instanceof Element && focused.closest(blocked))
      ) {
        return;
      }

      event.preventDefault();
      if (event.key === 'ArrowLeft') {
        goTo(activeIndex - 1, 'previous', true);
      } else {
        goTo(activeIndex + 1, 'next', true);
      }
    });
  } catch {
    restoreLongDocument();
  }
}

export {};
