/**
 * 桌面右键快捷操作菜单（共享运行时，SPEC §7.5）。
 *
 * - 纯 JS 模块，不 import 任何 CSS（与 reveal.ts 同约定，杜绝 CSS 聚合陷阱）。
 * - 由 src/components/ContextMenu.astro 在 `(hover: hover) and (pointer: fine)` 环境
 *   动态加载（触屏设备不加载本模块）。
 * - 只接管"非交互区域"的右键：链接 / 图片 / 输入控件 / 可编辑区 / 已选中文字 /
 *   触屏来源（混合设备长按）一律保留浏览器原生菜单，从不无条件 preventDefault。
 * - 随机语义与 router-script.ts 完全一致：存储格式 `{ designId, expiresAt }`；
 *   random → `now + cacheHours`（cacheHours=0 时窗口为 0）；fixed → `null`（永久记住）。
 *   本模块只在用户点击「随机一个设计」时写存储；页面加载/打开菜单不写。
 */

export interface ContextMenuTarget {
  id: string;
  href: string;
}

export interface ContextMenuRuntimeConfig {
  /** 当前设计 id：随机抽选必须排除（保证点击后确实发生切换）。 */
  currentId: string;
  /** 「切换设计…」目标（当前语言下的 /designs/，已经过 withBase）。 */
  switcherHref: string;
  /** Web Share 的 title 字段（页面标题）。 */
  shareTitle: string;
  /** 随机目标池 = 全部启用设计（含当前，运行时排除；href 已含当前语言前缀）。 */
  targets: ContextMenuTarget[];
  mode: 'random' | 'fixed';
  cacheHours: number;
  avoidRepeat: boolean;
  storageKey: string;
  /** 当前语言的 Toast 文案（构建期按 view.messages.toast 注入，运行时不做语言判断）。 */
  toast: ContextMenuToastMessages;
  /**
   * 语言切换项（普通 <a>，导航由浏览器处理，运行时无需参与）。
   * 保留在配置里是为了让运行时能识别它们不是"动作"——点击不应触发任何拦截。
   */
  languages?: Array<{ code: string; label: string; href: string; isCurrent: boolean }>;
}

export interface ContextMenuToastMessages {
  copied: string;
  copyFailed: string;
  shared: string;
  shareCancelled: string;
  shareFailed: string;
  noOtherDesign: string;
}

/** 保留原生菜单的元素（含宿主：未知的媒体/嵌入元素一律不动）。 */
const NATIVE_CONTEXT_SELECTOR = [
  'a[href]',
  'area[href]',
  'img',
  'picture',
  'video',
  'audio',
  'canvas',
  'iframe',
  'embed',
  'object',
  'input',
  'textarea',
  'select',
  'option',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

const VIEWPORT_MARGIN = 8;

export function initContextMenu(): void {
  const root = document.querySelector<HTMLElement>('[data-cm]');
  const configEl = document.querySelector<HTMLScriptElement>('[data-cm-config]');
  const toast = document.querySelector<HTMLElement>('[data-cm-toast]');
  if (!root || !configEl || !toast) return;

  let config: ContextMenuRuntimeConfig;
  try {
    config = JSON.parse(configEl.textContent ?? '') as ContextMenuRuntimeConfig;
  } catch {
    return;
  }
  if (
    !config ||
    !Array.isArray(config.targets) ||
    typeof config.storageKey !== 'string' ||
    !config.toast
  )
    return;

  /**
   * 当前**活跃层级**的菜单项。
   * 二级菜单（语言）的项也在 root 内，若用 root.querySelectorAll 会把它们混进
   * 上下键导航，导致焦点跳进子菜单——因此必须按层级取（见 activeMenu）。
   */
  const submenu = root.querySelector<HTMLElement>('[data-cm-submenu]');
  let activeMenu: HTMLElement = root;
  const items = (menu: HTMLElement = activeMenu) =>
    Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
      (item) => !item.closest('[data-cm-submenu]') || menu === submenu,
    );

  let open = false;
  let returnFocus: HTMLElement | null = null;
  let lastPointerType: string | null = null;
  let keyboardIntent = false;
  let toastTimer = 0;

  /* ---------- 反馈（Toast，role=status 由 SSR 提供） ---------- */

  const showToast = (message: string, tone: 'info' | 'error' = 'info') => {
    toast.textContent = message;
    toast.setAttribute('data-cm-tone', tone);
    toast.removeAttribute('hidden');
    toast.setAttribute('data-cm-show', '');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(
      () => {
        toast.removeAttribute('data-cm-show');
        window.setTimeout(() => toast.setAttribute('hidden', ''), 240);
      },
      tone === 'error' ? 3600 : 2500,
    );
  };

  /* ---------- 打开 / 关闭 / 定位 ---------- */

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const focusFirst = () => {
    const list = items().filter((item) => !item.hidden);
    (list[0] ?? root).focus({ preventScroll: true });
  };

  /* ---------- 二级菜单（语言） ---------- */

  const subTrigger = root.querySelector<HTMLElement>('[data-cm-submenu-trigger]');
  let subOpen = false;
  let hoverTimer = 0;

  /** 打开子菜单并定位：默认贴在触发项右侧，放不下则翻到左侧；纵向对齐触发项并收敛到视口内。 */
  const openSubmenu = () => {
    if (!submenu || !subTrigger || subOpen) return;
    window.clearTimeout(hoverTimer);
    subOpen = true;
    submenu.hidden = false;
    subTrigger.setAttribute('aria-expanded', 'true');
    root.setAttribute('data-cm-sub', '');
    const triggerRect = subTrigger.getBoundingClientRect();
    const rect = submenu.getBoundingClientRect();
    let left = triggerRect.right - 4;
    if (left + rect.width > window.innerWidth - VIEWPORT_MARGIN) {
      left = triggerRect.left - rect.width + 4; // 右侧放不下 → 翻到左侧
    }
    if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
    let top = triggerRect.top - 6;
    if (top + rect.height > window.innerHeight - VIEWPORT_MARGIN) {
      top = Math.max(VIEWPORT_MARGIN, window.innerHeight - VIEWPORT_MARGIN - rect.height);
    }
    submenu.style.left = `${Math.round(left)}px`;
    submenu.style.top = `${Math.round(top)}px`;
  };

  /** 焦点真正进入子菜单（点击或 → 键）时才切换导航层级。 */
  const enterSubmenu = () => {
    if (!submenu) return;
    openSubmenu();
    activeMenu = submenu;
    (items(submenu)[0] ?? submenu).focus({ preventScroll: true });
  };

  const closeSubmenu = (returnFocusToTrigger = false) => {
    if (!submenu || !subTrigger || !subOpen) return;
    window.clearTimeout(hoverTimer);
    subOpen = false;
    activeMenu = root;
    submenu.hidden = true;
    subTrigger.setAttribute('aria-expanded', 'false');
    root.removeAttribute('data-cm-sub');
    if (returnFocusToTrigger) subTrigger.focus({ preventScroll: true });
  };

  const show = (x: number, y: number, viaKeyboard: boolean) => {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.hidden = false;
    // 先渲染再测量，用真实尺寸做视口边界收敛（放不下则向光标另一侧翻转）
    const rect = root.getBoundingClientRect();
    let left = x + 2;
    let top = y + 2;
    if (left + rect.width > window.innerWidth - VIEWPORT_MARGIN) {
      left = Math.max(VIEWPORT_MARGIN, x - rect.width - 2);
    }
    if (top + rect.height > window.innerHeight - VIEWPORT_MARGIN) {
      top = Math.max(VIEWPORT_MARGIN, y - rect.height - 2);
    }
    root.style.left = `${Math.round(left)}px`;
    root.style.top = `${Math.round(top)}px`;
    open = true;
    root.setAttribute('data-cm-open', '');
    // 键盘打开：焦点落在第一项（带焦点环）；鼠标打开：焦点落在容器，
    // 首项不预高亮（对齐平台原生菜单观感）
    if (viaKeyboard) {
      root.setAttribute('data-cm-key', '');
      focusFirst();
    } else {
      root.removeAttribute('data-cm-key');
      root.focus({ preventScroll: true });
    }
  };

  const close = (restoreFocus: boolean) => {
    if (!open) return;
    open = false;
    closeSubmenu(false);
    activeMenu = root;
    root.hidden = true;
    root.removeAttribute('data-cm-open');
    if (restoreFocus && returnFocus && document.contains(returnFocus)) {
      returnFocus.focus({ preventScroll: true });
    }
    returnFocus = null;
  };

  /* ---------- 动作 ---------- */

  const readStoredDesignId = (): string | null => {
    try {
      const stored = JSON.parse(localStorage.getItem(config.storageKey) ?? 'null') as {
        designId?: unknown;
        expiresAt?: unknown;
      } | null;
      if (
        stored &&
        typeof stored.designId === 'string' &&
        (stored.expiresAt === null || typeof stored.expiresAt === 'number')
      ) {
        return stored.designId;
      }
    } catch {
      /* 存储损坏 → 视为无存储 */
    }
    return null;
  };

  const legacyCopy = (text: string): boolean => {
    try {
      // execCommand 已废弃，但它是 Clipboard API 不可用（非安全上下文 / 权限被拒）时
      // 唯一可用的同步复制降级路径。经自定义类型引用以避开废弃告警；必须保持以
      // document 为 this 调用（解构出的裸方法会触发 Illegal invocation，实测踩坑）。
      const doc = document as unknown as { execCommand?: (commandId: string) => boolean };
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.top = '-9999px';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      const ok = doc.execCommand?.('copy') ?? false;
      helper.remove();
      return ok;
    } catch {
      return false;
    }
  };

  const copyCurrentLink = async () => {
    const url = window.location.href;
    let ok = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) ok = legacyCopy(url);
    if (ok) showToast(config.toast.copied);
    else showToast(config.toast.copyFailed, 'error');
  };

  const sharePage = async () => {
    if (typeof navigator.share !== 'function') return; // 不支持时该项已在初始化时移除
    try {
      await navigator.share({ title: config.shareTitle, url: window.location.href });
      showToast(config.toast.shared);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        showToast(config.toast.shareCancelled);
      } else {
        showToast(config.toast.shareFailed, 'error');
      }
    }
  };

  const goRandom = () => {
    // 1) 必须排除当前设计（保证确实发生切换）；2) avoidRepeat 时再尽量排除上次选择
    let pool = config.targets.filter((target) => target.id !== config.currentId);
    if (config.mode === 'random' && config.avoidRepeat && pool.length > 1) {
      const previous = readStoredDesignId();
      if (previous) {
        const filtered = pool.filter((target) => target.id !== previous);
        if (filtered.length) pool = filtered;
      }
    }
    if (pool.length === 0) {
      showToast(config.toast.noOtherDesign);
      return;
    }
    const target = pool[Math.floor(Math.random() * pool.length)]!;
    // 与切换页/根脚本同语义：random 按 cacheHours 开窗（0 = 窗口为 0），fixed 永久记住
    const expiresAt =
      config.mode === 'random'
        ? config.cacheHours > 0
          ? Date.now() + config.cacheHours * 3600000
          : 0
        : null;
    try {
      localStorage.setItem(config.storageKey, JSON.stringify({ designId: target.id, expiresAt }));
    } catch {
      /* 存储不可用时仍导航（本次切换真实发生，只是不被记住） */
    }
    // 直接导航到目标设计的固定 URL（不回根路径，避免缓存把用户带回当前设计）
    window.location.assign(target.href);
  };

  /* ---------- 事件 ---------- */

  const hasSelection = () => {
    const selection = window.getSelection();
    return !!selection && !selection.isCollapsed && selection.toString().length > 0;
  };

  const isNativeContext = (target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) return false;
    if (hasSelection()) return true; // 已选中文字：保留原生（复制/搜索等）
    return !!target.closest(NATIVE_CONTEXT_SELECTOR);
  };

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    const viaKeyboardIntent = keyboardIntent;
    keyboardIntent = false;
    // 菜单已打开时的再次右键 = 收起；对链接 / 选中文字等原生目标不拦截（交给浏览器）
    if (open) {
      const native = isNativeContext(event.target);
      close(false);
      if (!native) event.preventDefault();
      return;
    }
    // 触屏来源（混合设备长按）不接管：不通过长按模拟右键菜单
    if (lastPointerType === 'touch') return;
    if (isNativeContext(event.target)) return;
    event.preventDefault();
    // 键盘（Shift+F10 / 上下文菜单键）事件的坐标可能为 0；退回到焦点元素附近 / 视口中部
    const keyboard = viaKeyboardIntent || (event.clientX === 0 && event.clientY === 0);
    let x = event.clientX;
    let y = event.clientY;
    if (event.clientX === 0 && event.clientY === 0) {
      const focused =
        document.activeElement instanceof HTMLElement && document.activeElement !== document.body
          ? document.activeElement.getBoundingClientRect()
          : null;
      if (focused && (focused.width > 0 || focused.height > 0)) {
        x = focused.left + Math.min(focused.width, 32);
        y = focused.bottom;
      } else {
        x = window.innerWidth / 2;
        y = Math.max(64, Math.round(window.innerHeight / 3));
      }
    }
    show(x, y, keyboard);
  });

  // 键盘意图标记：Shift+F10 / 上下文菜单键 → 聚焦首项并显示焦点环
  document.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if ((event.key === 'F10' && event.shiftKey) || event.key === 'ContextMenu') {
        keyboardIntent = true;
      }
    },
    true,
  );

  document.addEventListener(
    'pointerdown',
    (event: PointerEvent) => {
      lastPointerType = event.pointerType || null;
      if (!open) return;
      // 右键（button!==0）不在此收起：其"再次右键关闭"语义由 contextmenu 统一承担，
      // 否则 pointerdown 先关闭、contextmenu 又立即重新打开（实测缺陷，2026-10-10 v0.5.0）。
      if (event.button !== 0) return;
      if (event.target instanceof Node && root.contains(event.target)) return;
      close(false);
    },
    { capture: true, passive: true },
  );

  // 滚动 / 视口变化 → 收起（不锁定页面滚动）
  document.addEventListener('scroll', () => close(false), { capture: true, passive: true });
  window.addEventListener('resize', () => close(false));

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === 'Tab') {
      close(true); // 不困住焦点：菜单关闭，焦点自然移交
      return;
    }
    // 二级菜单：在主菜单层级 → → 打开并进入；在子菜单层级 → → 关闭并回到触发项
    if (event.key === 'ArrowRight') {
      if (subOpen) return; // 已在子菜单层级，→ 无意义（对齐原生菜单）
      const active = document.activeElement;
      if (active === subTrigger && submenu) {
        event.preventDefault();
        root.setAttribute('data-cm-key', '');
        enterSubmenu();
      }
      return;
    }
    if (event.key === 'ArrowLeft') {
      if (!subOpen) return; // 主菜单层级：← 不做水平移动（避免与浏览器返回混淆）
      event.preventDefault();
      closeSubmenu(true);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      root.setAttribute('data-cm-key', ''); // 键盘导航开始 → 显示焦点环
      const list = items().filter((item) => !item.hidden);
      if (list.length === 0) return;
      const current = list.indexOf(document.activeElement as HTMLElement);
      let next = 0;
      if (event.key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % list.length;
      if (event.key === 'ArrowUp') next = current < 0 ? list.length - 1 : (current - 1 + list.length) % list.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = list.length - 1;
      list[next]!.focus({ preventScroll: true });
      // ↑↓ 移到触发项时同步展开/收起子菜单（对齐原生菜单的 hover 语义）
      if (subTrigger) {
        if (list[next] === subTrigger) openSubmenu();
        else if (subOpen) closeSubmenu(false);
      }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      const active = document.activeElement;
      if (active instanceof HTMLElement && root.contains(active)) {
        event.preventDefault();
        active.click(); // 禁用项由 click 委托统一拦截
      }
    }
  });

  // 悬浮打开二级菜单：带极短延迟，避免鼠标横扫时误开（对齐原生菜单）
  if (subTrigger && submenu) {
    subTrigger.addEventListener('pointerenter', (event: PointerEvent) => {
      if (event.pointerType === 'touch') return; // 触屏无悬浮语义
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(openSubmenu, 120);
    });
    subTrigger.addEventListener('pointerleave', (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      window.clearTimeout(hoverTimer);
      // 延迟关闭：给指针移入子菜单留出时间（斜向移动不应误关）
      hoverTimer = window.setTimeout(() => closeSubmenu(false), 220);
    });
    submenu.addEventListener('pointerenter', (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      window.clearTimeout(hoverTimer);
    });
    submenu.addEventListener('pointerleave', (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => closeSubmenu(false), 180);
    });
    // 点击触发项 = 切换子菜单（触屏与键盘 Enter 的等价路径）
    subTrigger.addEventListener('click', (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (subOpen) closeSubmenu(true);
      else enterSubmenu();
    });
  }

  root.addEventListener('click', (event: MouseEvent) => {
    const item =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-cm-action]')
        : null;
    if (!item || !root.contains(item)) return;
    if (item.getAttribute('aria-disabled') === 'true') return;
    const action = item.getAttribute('data-cm-action');
    // 语言项是原生 <a> 导航：不拦截默认行为，只收起整个菜单
    if (item.classList.contains('cm-lang')) {
      close(false);
      return;
    }
    if (action !== 'switch') close(false); // 「切换设计…」是原生 <a> 导航，不拦截默认行为
    switch (action) {
      case 'reload':
        window.location.reload();
        break;
      case 'top':
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        break;
      case 'copy':
        void copyCurrentLink();
        break;
      case 'print':
        window.print();
        break;
      case 'share':
        void sharePage();
        break;
      case 'random':
        goRandom();
        break;
      case 'switch':
        break; // 交给 <a href> 的默认导航（支持 Ctrl/中键开新标签）
    }
  });

  // Web Share 不支持 → 移除「分享页面」，菜单里不存在点了没反应的项
  const shareItem = root.querySelector<HTMLElement>('[data-cm-action="share"]');
  if (shareItem && typeof navigator.share !== 'function') shareItem.remove();
}