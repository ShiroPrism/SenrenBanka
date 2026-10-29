/**
 * 滚动显现机制（共享）——只负责"触发"，不规定任何视觉。
 *
 * 契约（见 docs/adr/0001-motion-reveal-mechanism.md 与 docs/rules/visual-language.md「动效（Motion）」）：
 * - 观察目标：`[data-reveal]`
 * - 首次到达视口：置 `[data-reveal-in]`，随即 unobserve（只播一次）
 * - 门控：`<html data-reveal-ready>` 由 `Reveal.astro` 的内联 boot 同步写入，
 *   仅当「非 prefers-reduced-motion: reduce 且支持 IntersectionObserver」时成立。
 *   因此无 JS / 无 IO / 减动态三种情况下内容始终可见。
 * - 脚本失败（模块未执行或抛错）由「内联计时安全网 + 本模块 try/catch」兜底，
 *   撤销门控并全部揭示，内容同样保持可见。
 * - 时长 / 缓动 / 位移 / 错落顺序一律由各设计的 style.css 维护。
 *
 * 本模块不得 import 任何 CSS，否则会破坏设计间的样式隔离（SPEC §3.2）。
 */

const TARGET_SELECTOR = '[data-reveal]';
const ENTER_ATTR = 'data-reveal-in';
const READY_ATTR = 'data-reveal-ready';
const INIT_ATTR = 'data-reveal-init';

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: '0px 0px -10% 0px',
};

/** 兜底：显式标记为已到达，确保内容可见。 */
function enterAll(targets: readonly Element[]): void {
  for (const element of targets) element.setAttribute(ENTER_ATTR, '');
}

function setup(targets: readonly Element[]): void {
  const root = document.documentElement;
  // 标记"脚本已执行"，供内联计时安全网判断（见 Reveal.astro）。
  root.setAttribute(INIT_ATTR, '');

  if (!root.hasAttribute(READY_ATTR)) {
    enterAll(targets);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      entry.target.setAttribute(ENTER_ATTR, '');
    }
  }, OBSERVER_OPTIONS);
  for (const element of targets) observer.observe(element);

  // 兜底：锚点跳转 / 浏览器恢复滚动位置 / End 键会让元素"从视口下方直接跳到上方"，
  // 这一过程不跨越 IntersectionObserver 的阈值，不产生任何通知 → 元素将永久隐藏。
  // 因此在滚动时补揭示"已到达视口"的目标；全部揭示后即移除监听。
  let scheduled = false;

  function runCatchUp(): void {
    scheduled = false;
    let remaining = false;
    for (const element of targets) {
      if (element.hasAttribute(ENTER_ATTR)) continue;
      if (element.getBoundingClientRect().top < window.innerHeight) {
        observer.unobserve(element);
        element.setAttribute(ENTER_ATTR, '');
      } else {
        remaining = true;
      }
    }
    if (!remaining) window.removeEventListener('scroll', handleScroll);
  }

  function handleScroll(): void {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(runCatchUp);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  runCatchUp();
}

export function initReveal(root: ParentNode = document): void {
  const targets = Array.from(root.querySelectorAll(TARGET_SELECTOR));
  if (targets.length === 0) return;

  try {
    setup(targets);
  } catch {
    // 脚本失败（如 IntersectionObserver 不可用）：撤销门控并全部揭示，保证内容可见（契约要求）。
    document.documentElement.removeAttribute(READY_ATTR);
    enterAll(targets);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initReveal(), { once: true });
  } else {
    initReveal();
  }
}
