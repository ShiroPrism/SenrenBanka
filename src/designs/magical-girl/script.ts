/**
 * magical-girl's only client behavior: one legible stage entrance.
 * Content is already complete in the document. This module only plays finite
 * Web Animations that return to the same final CSS state, so a failure or a
 * missed frame can never strand the dossier in a hidden state.
 */

const root = document.querySelector<HTMLElement>('[data-mg-root]');

if (root) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!reducedMotion.matches && document.visibilityState === 'visible') {
    const animations: Animation[] = [];
    let cleaned = false;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      document.removeEventListener('visibilitychange', finishWhenHidden);
      reducedMotion.removeEventListener?.('change', finishWhenReduced);
      delete root.dataset.mgEntrance;
      for (const animation of animations) {
        try {
          animation.cancel();
        } catch {
          // A finished animation has already returned to the final CSS state.
        }
      }
      animations.length = 0;
    };

    const finishNow = () => {
      for (const animation of animations) {
        try {
          if (animation.playState !== 'finished') animation.finish();
        } catch {
          // A cancelled/replaced animation already has no visible state to fix.
        }
      }
      cleanup();
    };

    const finishWhenHidden = () => {
      if (document.hidden) finishNow();
    };

    const finishWhenReduced = (event: MediaQueryListEvent) => {
      if (event.matches) finishNow();
    };

    try {
      root.dataset.mgEntrance = 'playing';

      const add = (
        elements: NodeListOf<Element>,
        keyframes: Keyframe[],
        options: KeyframeAnimationOptions,
      ) => {
        for (const element of elements) {
          if (element instanceof Element) animations.push(element.animate(keyframes, options));
        }
      };

      // The first three gestures share one arrival window; the orbit lands last.
      add(
        root.querySelectorAll('[data-mg-dossier]'),
        [
          { opacity: 0.78, transform: 'translate3d(0, 1.1rem, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ],
        {
          duration: 840,
          delay: 40,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
      );

      add(
        root.querySelectorAll('[data-mg-ribbon]'),
        [
          { opacity: 0.35, transform: 'translate3d(-1.4rem, 0, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ],
        {
          duration: 920,
          delay: 40,
          easing: 'cubic-bezier(0.22, 0.8, 0.24, 1)',
        },
      );

      add(
        root.querySelectorAll<SVGPathElement>('[data-mg-trail]'),
        [
          { strokeDashoffset: 1, opacity: 0.35 },
          { strokeDashoffset: 0, opacity: 1 },
        ],
        {
          duration: 1000,
          delay: 20,
          easing: 'cubic-bezier(0.22, 0.8, 0.24, 1)',
        },
      );

      add(
        root.querySelectorAll('[data-mg-orbit]'),
        [
          { opacity: 0.22, transform: 'rotate(-18deg) scale(0.97)' },
          { opacity: 1, transform: 'rotate(0deg) scale(1)' },
        ],
        {
          duration: 1040,
          delay: 20,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
      );

      document.addEventListener('visibilitychange', finishWhenHidden);
      reducedMotion.addEventListener('change', finishWhenReduced);

      void Promise.allSettled(animations.map((animation) => animation.finished)).then(cleanup);
    } catch {
      finishNow();
    }
  }
}

export {};
