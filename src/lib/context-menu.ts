/**
 * 全站共享操作菜单（Action menu）的运行时，ADR 0007。
 *
 * - 纯 JS 模块，不 import 任何 CSS（与 reveal.ts 同约定，杜绝 CSS 聚合陷阱）。
 * - 数据 / 文案 / 动作 / 状态语义在所有输入环境共享；**容器形态**分叉：
 *   桌面 = 贴近光标的浮层菜单（ContextMenu.astro 的 `.cm`），语言项收在二级子菜单；
 *   移动 = 底部动作面板（`.cm-sheet`），语言项平铺。两份 DOM 由 SSR 同时输出，
 *   运行时按输入能力摘掉不需要的那份（`hidden` 同时移出无障碍树）。
 * - 只接管"非交互区域"的右键：链接 / 图片 / 输入控件 / 可编辑区 / 已选中文字 /
 *   触屏来源（混合设备长按）一律保留浏览器原生菜单，从不无条件 preventDefault。
 * - 移动端由悬浮球（Launcher）点击打开，不依赖长按，也不拦截原生长按与文本选择。
 * - 随机语义与 router-script.ts 完全一致：存储格式 `{ designId, expiresAt }`；
 *   random → `now + cacheHours`（cacheHours=0 时窗口为 0）；fixed → `null`（永久记住）。
 *   本模块只在用户点击「随机一个设计」时写存储；页面加载/打开菜单不写。
 */
import type { LocaleMessages } from '../i18n/messages';

export interface ContextMenuTarget {
  id: string;
  href: string;
}

/**
 * 页面上下文（ADR 0007）。菜单据此决定身份条、随机排除、切换页项显隐与语言项目标。
 * 不假设每页都存在"当前主题"——切换页与 404 没有 `designId`。
 */
export type PageContext =
  | { kind: 'design'; designId: string; designName: string; accent?: string }
  | { kind: 'switcher' }
  | { kind: 'not-found' };

export interface ContextMenuLanguageItem {
  code: string;
  path: string;
  label: string;
  href: string;
  isCurrent: boolean;
}

export interface ContextMenuRuntimeConfig {
  /** 当前页面上下文：`designId` 只在 design 页存在，随机抽选才需要排除它。 */
  context: PageContext;
  /** 「全部设计」目标（当前语言下的 /designs/，已经过 withBase）。切换页上该动作不渲染。 */
  switcherHref: string;
  /** Web Share 的 title 字段（页面标题）。 */
  shareTitle: string;
  /** 随机目标池 = 全部启用设计（含 design 页的自身，运行时排除；href 已含当前语言前缀）。 */
  targets: ContextMenuTarget[];
  mode: 'random' | 'fixed';
  cacheHours: number;
  avoidRepeat: boolean;
  storageKey: string;
  /** 语言偏好存储键；与设计偏好独立，始终按部署 base 派生。 */
  localeStorageKey: string;
  /** 当前语言的 Toast 文案（构建期按 view.messages.toast 注入，运行时不做语言判断）。 */
  toast: ContextMenuToastMessages;
  /** 悬浮球与动作面板的无障碍文案。 */
  launcherLabel: string;
  /** 底部动作面板的 group aria-label（与桌面菜单同一套角色语义）。 */
  menuLabel: string;
  /** 面板内关闭控件与分组标题的文案（SSR 已渲染，运行时仅用于日志/调试对齐）。 */
  closeLabel: string;
  cancel: string;
  /**
   * 语言切换项（普通 <a>，导航由浏览器处理）。
   * 运行时只在显式激活时读取 `path` 写入语言偏好；默认导航不拦截。
   */
  languages?: ContextMenuLanguageItem[];
  /**
   * 按 Locale path 索引的运行时变体。仅 404 使用：页面已在 head 解析出
   * `html[data-404-locale]`，菜单据此只替换自身文案与目标，不复制 DOM。
   */
  localeVariants?: Record<string, ContextMenuLocaleVariant>;
}

export interface ContextMenuToastMessages {
  copied: string;
  copyFailed: string;
  shared: string;
  shareCancelled: string;
  shareFailed: string;
  noOtherDesign: string;
}

/**
 * 404 多语言菜单的运行时变体。字段只覆盖随 Locale 变化的部分；context / mode /
 * storageKey 等页面级语义由主配置共享。
 */
export interface ContextMenuLocaleVariant {
  switcherHref: string;
  shareTitle: string;
  targets: ContextMenuTarget[];
  toast: ContextMenuToastMessages;
  launcherLabel: string;
  menuLabel: string;
  closeLabel: string;
  cancel: string;
  languages?: ContextMenuLanguageItem[];
  /** 静态标签（动作 / 分组 / 关闭 / 取消）的当前语言文案。 */
  contextMenu: LocaleMessages['contextMenu'];
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

/** 输入方式偏好（混合设备的悬浮球显隐）。会话级属性，不进主题偏好键空间。 */
const INPUT_MODE_KEY = 'senrenbanka.input.v1';

type InputMode = 'touch' | 'mouse';

export function initContextMenu(): void {
  const root = document.querySelector<HTMLElement>('[data-cm]');
  const sheet = document.querySelector<HTMLElement>('[data-cm-sheet]');
  const scrim = document.querySelector<HTMLElement>('[data-cm-scrim]');
  const launcher = document.querySelector<HTMLElement>('[data-cm-launcher]');
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
    !config.context ||
    !Array.isArray(config.targets) ||
    typeof config.storageKey !== 'string' ||
    typeof config.localeStorageKey !== 'string' ||
    !config.toast
  )
    return;

  const notFoundLocale = document.documentElement.getAttribute('data-404-locale');
  const localeVariant =
    notFoundLocale && config.localeVariants ? config.localeVariants[notFoundLocale] : undefined;

  /** 只有 design 页有"当前主题"，随机时才需要排除它（切换页/404 不得排除不存在的当前）。 */
  const currentId = config.context.kind === 'design' ? config.context.designId : null;

  /**
   * 某个层级内的菜单项。
   * 二级菜单（语言）的项也在 root 内，若直接 root.querySelectorAll 会把它们混进
   * 上下键导航，导致焦点跳进子菜单——因此取某层级时必须剔除属于子菜单的项。
   */
  const submenu = root.querySelector<HTMLElement>('[data-cm-submenu]');
  const items = (menu: HTMLElement) =>
    Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
      (item) => !item.closest('[data-cm-submenu]') || menu === submenu,
    );

  /**
   * 404 的菜单静态 DOM 默认按默认 Locale 渲染；页面 head 已把展示 Locale 写到
   * `html[data-404-locale]`。这里只更新这一份 DOM 的文案 / 目标 / 当前项，
   * 菜单容器、动作顺序与交互逻辑保持不变。
   */
  const applyMenuLocale = (variant: ContextMenuLocaleVariant) => {
    const text = variant.contextMenu;
    const setText = (selector: string, value: string) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((node) => {
        node.textContent = value;
      });
    };

    root.setAttribute('aria-label', variant.menuLabel);
    sheet?.setAttribute('aria-label', variant.menuLabel);
    launcher?.setAttribute('aria-label', variant.launcherLabel);
    setText('.cm-sheet-title', variant.menuLabel);
    setText('.cm-sheet-cancel', variant.cancel);
    document.querySelectorAll<HTMLElement>('.cm-sheet-close').forEach((node) => {
      node.setAttribute('aria-label', variant.closeLabel);
    });

    const groupLabels: Record<string, string> = {
      page: text.pageGroup,
      design: text.designGroup,
      language: text.languageGroup,
    };
    document.querySelectorAll<HTMLElement>('[data-cm-group]').forEach((node) => {
      const key = node.getAttribute('data-cm-group');
      const label = key ? groupLabels[key] : undefined;
      if (label) node.textContent = label;
    });

    const actionLabels: Record<string, string> = {
      reload: text.reload,
      top: text.toTop,
      copy: text.copyLink,
      print: text.print,
      share: text.share,
      random: text.random,
      switch: text.switchDesign,
    };
    document.querySelectorAll<HTMLElement>('[data-cm-action]').forEach((node) => {
      const action = node.getAttribute('data-cm-action');
      const label = action ? actionLabels[action] : undefined;
      const labelNode = node.querySelector<HTMLElement>('.cm-label');
      if (label && labelNode) labelNode.textContent = label;
      if (action === 'switch' && node instanceof HTMLAnchorElement) {
        node.href = variant.switcherHref;
      }
      if (action === 'random') {
        if (variant.targets.length < 2) node.setAttribute('aria-disabled', 'true');
        else node.removeAttribute('aria-disabled');
      }
    });

    const triggerLabel = root.querySelector<HTMLElement>('[data-cm-submenu-trigger] .cm-label');
    if (triggerLabel) triggerLabel.textContent = text.languageGroup;
    submenu?.setAttribute('aria-label', text.languageGroup);

    const languages = variant.languages ?? [];
    document.querySelectorAll<HTMLAnchorElement>('.cm-lang').forEach((link) => {
      const path = link.getAttribute('data-cm-locale');
      const item = languages.find((entry) => entry.path === path);
      if (!item) return;
      link.href = item.href;
      if (item.isCurrent) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      const check = link.querySelector<SVGElement>('.cm-check');
      if (!check) return;
      check.classList.toggle('cm-check-hidden', !item.isCurrent);
    });
  };

  /**
   * 输入环境判定（ADR 0007）。
   * 媒体查询只做**初判**；混合输入设备（触屏笔记本、大屏一体机）上以最近一次
   * 真实指针事件的 `pointerType` 为准，并记入会话级存储，避免每次都重新猜。
   */
  const readStoredInputMode = (): InputMode | null => {
    try {
      const value = sessionStorage.getItem(INPUT_MODE_KEY);
      return value === 'touch' || value === 'mouse' ? value : null;
    } catch {
      return null;
    }
  };
  const writeStoredInputMode = (mode: InputMode) => {
    try {
      sessionStorage.setItem(INPUT_MODE_KEY, mode);
    } catch {
      /* 会话存储不可用 → 仅本次页面内生效，不影响功能 */
    }
  };

  const coarseQuery = window.matchMedia('(any-pointer: coarse)');
  const desktopQuery = window.matchMedia('(hover: hover) and (any-pointer: fine)');
  const guessInputMode = (): InputMode =>
    coarseQuery.matches && !desktopQuery.matches ? 'touch' : 'mouse';
  /** 当前按哪种形态呈现：桌面浮层菜单（mouse）vs 移动底部动作面板（touch）。 */
  let touchMode: InputMode = readStoredInputMode() ?? guessInputMode();
  const inTouchMode = () => touchMode === 'touch';

  /**
   * 切换形态：只改「哪一份 DOM 参与交互」，不重建任何节点。
   * 被摘下的那份用 `hidden`（同时移出无障碍树，不会被重复朗读）；
   * 另一份的静态 DOM 仍在产物里——移动端无 JS 时它就是语言切换的可达路径。
   */
  const applyMode = () => {
    document.documentElement.setAttribute('data-cm-input', touchMode);
    // 形态切换一律先收起：跨环境时不能把旧的展开态带过去。
    // 走 `finallyHide` 而非 `closeMenu`：形态切换不需要退场动画，
    // 直接落到终态（否则半路切形态会留下一个正在播动画的旧面板）。
    open = false;
    finallyHide();
    submenuHidden();
    // 浮层菜单初始必须隐藏（它只在右键 / Shift+F10 时才出现）。
    root.hidden = true;
    root.removeAttribute('data-cm-open');
    if (scrim) {
      scrim.hidden = true;
      scrim.removeAttribute('data-cm-open');
    }
    // 面板初始必须隐藏——它由悬浮球点击 `show()` 才打开（v0.10.0 实测踩坑：
    // 写成 `sheet.hidden = !inTouchMode()` 等于「移动端永远打开面板」）。
    if (sheet) {
      sheet.hidden = true;
      sheet.removeAttribute('data-cm-open');
    }
    // 悬浮球是移动端形态下**唯一**的常驻入口，其余容器都由 open 状态决定显隐。
    if (launcher) {
      launcher.hidden = !inTouchMode();
      launcher.setAttribute('aria-expanded', 'false');
    }
    unlockScroll();
  };

  let open = false;
  let returnFocus: HTMLElement | null = null;
  let lastPointerType: string | null = null;
  let keyboardIntent = false;
  let toastTimer = 0;
  let scrollLocked = false;
  let closeTimer = 0;

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

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const focusFirst = (menu: HTMLElement) => {
    const list = items(menu).filter((item) => !item.hidden);
    (list[0] ?? menu).focus({ preventScroll: true });
  };

  /* ---------- 二级菜单（语言，仅桌面形态） ---------- */

  const subTrigger = root.querySelector<HTMLElement>('[data-cm-submenu-trigger]');
  let subOpen = false;
  let hoverTimer = 0;

  /** 强制收起子菜单（切换输入环境时用，不归还焦点）。 */
  const submenuHidden = () => {
    if (!submenu || !subTrigger || !subOpen) return;
    subOpen = false;
    submenu.hidden = true;
    subTrigger.setAttribute('aria-expanded', 'false');
  };

  /** 打开子菜单并定位：默认贴在触发项右侧，放不下则翻到左侧；纵向对齐触发项并收敛到视口内。 */
  const openSubmenu = () => {
    if (!submenu || !subTrigger || subOpen || inTouchMode()) return;
    window.clearTimeout(hoverTimer);
    subOpen = true;
    submenu.hidden = false;
    subTrigger.setAttribute('aria-expanded', 'true');
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

  /** 焦点真正进入子菜单（点击或 → 键）时才把导航层级带到子菜单。 */
  const enterSubmenu = () => {
    if (!submenu || inTouchMode()) return;
    openSubmenu();
    (items(submenu)[0] ?? submenu).focus({ preventScroll: true });
  };

  const closeSubmenu = (returnFocusToTrigger = false) => {
    if (!submenu || !subTrigger || !subOpen) return;
    window.clearTimeout(hoverTimer);
    subOpen = false;
    submenu.hidden = true;
    subTrigger.setAttribute('aria-expanded', 'false');
    if (returnFocusToTrigger) subTrigger.focus({ preventScroll: true });
  };

  /** 打开底部动作面板时锁住背景滚动：锁 `<html>` 本身不丢滚动位置，无需 position:fixed 技巧。 */
  const lockScroll = () => {
    if (scrollLocked) return;
    scrollLocked = true;
    document.documentElement.classList.add('cm-scroll-locked');
  };
  const unlockScroll = () => {
    if (!scrollLocked) return;
    scrollLocked = false;
    document.documentElement.classList.remove('cm-scroll-locked');
  };

  /**
   * 打开菜单。`touch` 为真表示底部动作面板（定位由 CSS 负责），
   * 否则是桌面浮层菜单（按光标坐标定位并向视口内收敛）。
   */
  const show = (x: number, y: number, viaKeyboard: boolean) => {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    open = true;
    if (inTouchMode() && sheet) {
      window.clearTimeout(closeTimer);
      sheet.hidden = false;
      sheet.removeAttribute('data-cm-closing');
      sheet.setAttribute('data-cm-open', '');
      if (scrim) {
        scrim.hidden = false;
        scrim.removeAttribute('data-cm-closing');
        scrim.setAttribute('data-cm-open', '');
      }
      launcher?.setAttribute('aria-expanded', 'true');
      lockScroll();
      // 触屏没有"当前项"的概念，预高亮首项反而像误选；只把焦点给过去（读屏可用），不画焦点环。
      // 键盘 / 屏幕阅读器用户随后按 ↑↓ 时才点亮 `data-cm-key`。
      sheet.removeAttribute('data-cm-key');
      focusFirst(sheet);
      // 入场动画播完后摘掉触发属性，让面板回到**无动画的自然终态**。
      // 不这样做时，动画若被打断（快速连点、页面被隐藏、reduced-motion 切换）会让面板
      // 停在动画中途的位移上——用户点了像没反应（2026-10-13 实测踩坑）。
      // 用 animationend 而非定时器，避免与动画时长脱节。
      const clearOpenAttr = () => sheet.removeAttribute('data-cm-open');
      sheet.addEventListener('animationend', clearOpenAttr, { once: true });
      return;
    }
    if (inTouchMode()) return;
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
    root.setAttribute('data-cm-open', '');
    // 键盘打开：焦点落在第一项（带焦点环）；鼠标打开：焦点落在容器，
    // 首项不预高亮（对齐平台原生菜单观感）
    if (viaKeyboard) {
      root.setAttribute('data-cm-key', '');
      focusFirst(root);
    } else {
      root.removeAttribute('data-cm-key');
      root.focus({ preventScroll: true });
    }
  };

  /**
   * 关闭。触屏形态下先播 200ms 退场动画再隐藏，让"关掉了"这件事有反馈——
   * 直接 `hidden = true` 会让面板凭空消失，用户不确定自己点到了没有。
   * 动画不可用（减动态 / rAF 被节流）时由 `finallyHide` 兜底，绝不留在半开状态。
   */
  const finallyHide = () => {
    window.clearTimeout(closeTimer);
    if (sheet) {
      sheet.hidden = true;
      sheet.removeAttribute('data-cm-open');
      sheet.removeAttribute('data-cm-closing');
    }
    if (scrim) {
      scrim.hidden = true;
      scrim.removeAttribute('data-cm-open');
      scrim.removeAttribute('data-cm-closing');
    }
    unlockScroll();
  };

  const closeMenu = (restoreFocus: boolean) => {
    if (!open) return;
    open = false;
    closeSubmenu(false);
    root.hidden = true;
    root.removeAttribute('data-cm-open');
    launcher?.setAttribute('aria-expanded', 'false');
    if (restoreFocus && returnFocus && document.contains(returnFocus)) {
      returnFocus.focus({ preventScroll: true });
    }
    returnFocus = null;
    // 移动形态：先退场动画。桌面浮层即时隐藏即可（它没有"从边缘滑走"的空间）。
    if (!inTouchMode() || !sheet || sheet.hidden) {
      finallyHide();
      return;
    }
    sheet.removeAttribute('data-cm-open');
    sheet.setAttribute('data-cm-closing', '');
    if (scrim && !scrim.hidden) {
      scrim.removeAttribute('data-cm-open');
      scrim.setAttribute('data-cm-closing', '');
    }
    // 兜底：动画可能因 rAF 节流而不推进（headless / 后台标签页实测），
    // 定时器保证面板最终一定被隐藏，不会卡在"关了但还在"。
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(finallyHide, 260);
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
    // 1) design 页必须排除当前设计（保证确实发生切换）；切换页 / 404 没有当前主题，全池可选
    // 2) avoidRepeat 时再尽量排除上次选择
    let pool = currentId
      ? config.targets.filter((target) => target.id !== currentId)
      : [...config.targets];
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
    // 移动端形态由悬浮球负责，右键不接管（触屏不靠长按打开）
    if (inTouchMode()) return;
    // 菜单已打开时的再次右键 = 收起；对链接 / 选中文字等原生目标不拦截（交给浏览器）
    if (open) {
      const native = isNativeContext(event.target);
      closeMenu(false);
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
      // 混合输入设备：按真实指针类型切换呈现形态，并记入会话（下次加载不再猜）
      if (event.pointerType === 'touch' || event.pointerType === 'mouse') {
        const next: InputMode = event.pointerType === 'touch' ? 'touch' : 'mouse';
        if (next !== touchMode) {
          touchMode = next;
          writeStoredInputMode(next);
          applyMode();
        }
      }
      if (!open) return;
      // 右键（button!==0）不在此收起：其"再次右键关闭"语义由 contextmenu 统一承担，
      // 否则 pointerdown 先关闭、contextmenu 又立即重新打开（实测缺陷，2026-10-10 v0.5.0）。
      if (event.button !== 0) return;
      const target = event.target;
      if (target instanceof Node) {
        // 点在当前呈现的这一份里 → 不在此收起。
        // 必须用 `contains()` 而不是 `=== 元素`：点在按钮**内部的图标**上时
        // `event.target` 是 <svg> 而不是按钮本身，`===` 会漏判，
        // 后果是悬浮球刚打开面板、又被同一笔点击的冒泡立刻关掉（2026-10-13 实测踩坑）。
        if (
          root.contains(target) ||
          sheet?.contains(target) ||
          (launcher && launcher.contains(target)) ||
          (scrim && scrim.contains(target))
        )
          return;
      }
      closeMenu(false);
    },
    { capture: true, passive: true },
  );

  // 桌面菜单随滚动 / 视口变化收起；面板打开时背景已被锁滚动，只有面板内部滚动会触发，
  // 那种情况不应把面板自己关掉（移动端的交互模型与桌面浮层不同）。
  document.addEventListener(
    'scroll',
    (event: Event) => {
      if (!open) return;
      if (inTouchMode() && event.target instanceof Node && sheet?.contains(event.target)) return;
      closeMenu(false);
    },
    { capture: true, passive: true },
  );
  window.addEventListener('resize', () => closeMenu(false));
  // 屏幕旋转 / 折叠展开可能改写能力查询 → 重判形态
  coarseQuery.addEventListener('change', () => {
    if (readStoredInputMode()) return; // 用户已明确表达过偏好，不再被媒体查询推翻
    touchMode = guessInputMode();
    applyMode();
  });

  // 悬浮球：点击 / 键盘激活打开底部动作面板（不靠长按，也不拦截原生长按）
  launcher?.addEventListener('click', () => {
    if (open) closeMenu(true);
    else show(0, 0, true);
  });
  // 遮罩：点击空白处收起（与原生菜单"点外面关闭"同语义）。
  // 它只是兜底路径——面板内已有关闭按钮与取消条，用户不该"只能"来点这块没有
  // 可点击暗示的暗色区域。
  document.addEventListener('click', (event: MouseEvent) => {
    if (!open || !inTouchMode()) return;
    const target = event.target;
    if (
      target instanceof Node &&
      ((sheet && sheet.contains(target)) ||
        (launcher && launcher.contains(target)) ||
        (scrim && scrim.contains(target)))
    )
      return;
    closeMenu(false);
  });
  scrim?.addEventListener('click', () => closeMenu(false));

  // 面板内关闭控件（头部 ✕ / 底部取消条）——两者都是面板内的显式出口，
  // 命中区 ≥44px，不需要用户去够遮罩。
  sheet
    ?.querySelectorAll<HTMLElement>('[data-cm-close]')
    .forEach((btn) => btn.addEventListener('click', () => closeMenu(true)));

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key === 'Tab') {
      closeMenu(true); // 不困住焦点：菜单关闭，焦点自然移交
      return;
    }
    // 二级菜单：桌面形态下 → 进入 / ← 返回；移动端语言项平铺，无子菜单层级
    // 注意判据是「焦点是否已在子菜单内」而非「子菜单是否已展开」——
    // ↑↓ 移到触发项会自动展开子菜单但焦点仍留在触发项，此时 → 必须能进入。
    if (event.key === 'ArrowRight') {
      if (inTouchMode() || (subOpen && submenu?.contains(document.activeElement))) return;
      const active = document.activeElement;
      if (active === subTrigger && submenu) {
        event.preventDefault();
        root.setAttribute('data-cm-key', '');
        enterSubmenu();
      }
      return;
    }
    if (event.key === 'ArrowLeft') {
      if (!subOpen || !submenu?.contains(document.activeElement)) return; // 主菜单层级：← 不做水平移动（避免与浏览器返回混淆）
      event.preventDefault();
      closeSubmenu(true);
      return;
    }
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.preventDefault();
      const inSubmenu = !inTouchMode() && !!submenu?.contains(document.activeElement);
      const menu = inSubmenu ? submenu! : inTouchMode() && sheet ? sheet : root;
      menu.setAttribute('data-cm-key', ''); // 键盘导航开始 → 显示焦点环
      // 导航层级跟随**焦点实际所在处**：焦点在子菜单内就在子菜单内循环，
      // 否则 ↑↓ 会把焦点拽回主菜单（subOpen 只表示子菜单已展开，不等于焦点已进入）。
      const list = items(menu).filter((item) => !item.hidden);
      if (list.length === 0) return;
      const current = list.indexOf(document.activeElement as HTMLElement);
      let next = 0;
      if (event.key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % list.length;
      if (event.key === 'ArrowUp')
        next = current < 0 ? list.length - 1 : (current - 1 + list.length) % list.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = list.length - 1;
      list[next]!.focus({ preventScroll: true });
      // 同步子菜单展开态：主菜单层级 ↑↓ 移到触发项时展开、移开时收起；
      // 子菜单层级不做这件事（否则每按一次就把子菜单收起来，焦点随即丢失）。
      if (subTrigger && !inTouchMode() && !inSubmenu) {
        if (list[next] === subTrigger) openSubmenu();
        else if (subOpen) closeSubmenu(false);
      }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      const active = document.activeElement;
      if (active instanceof HTMLElement && (root.contains(active) || sheet?.contains(active))) {
        event.preventDefault();
        active.click(); // 禁用项由 click 委托统一拦截
      }
    }
  });

  // 悬浮打开二级菜单：带极短延迟，避免鼠标横扫时误开（对齐原生菜单）
  if (subTrigger && submenu) {
    subTrigger.addEventListener('pointerenter', (event: PointerEvent) => {
      if (event.pointerType === 'touch' || inTouchMode()) return; // 触屏无悬浮语义
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(openSubmenu, 120);
    });
    subTrigger.addEventListener('pointerleave', (event: PointerEvent) => {
      if (event.pointerType === 'touch' || inTouchMode()) return;
      window.clearTimeout(hoverTimer);
      // 延迟关闭：给指针移入子菜单留出时间（斜向移动不应误关）
      hoverTimer = window.setTimeout(() => closeSubmenu(false), 220);
    });
    submenu.addEventListener('pointerenter', (event: PointerEvent) => {
      if (event.pointerType === 'touch' || inTouchMode()) return;
      window.clearTimeout(hoverTimer);
    });
    submenu.addEventListener('pointerleave', (event: PointerEvent) => {
      if (event.pointerType === 'touch' || inTouchMode()) return;
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => closeSubmenu(false), 180);
    });
    // 点击触发项 = 切换子菜单（触屏与键盘 Enter 的等价路径，因此不依赖 hover）
    subTrigger.addEventListener('click', (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (subOpen) closeSubmenu(true);
      else enterSubmenu();
    });
  }

  const rememberLocale = (item: HTMLElement) => {
    const path = item.getAttribute('data-cm-locale');
    if (!path) return;
    try {
      localStorage.setItem(config.localeStorageKey, path);
    } catch {
      /* 存储不可用：本次导航仍正常，偏好不被记住 */
    }
  };

  /** 动作点击委托：桌面菜单与移动面板共用同一份实现。 */
  const onActionClick = (event: MouseEvent) => {
    const item =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-cm-action], .cm-lang')
        : null;
    if (!item) return;
    if (item.getAttribute('aria-disabled') === 'true') return;
    const action = item.getAttribute('data-cm-action');
    // 语言项是原生 <a> 导航：不拦截默认行为，只收起整个菜单
    if (item.classList.contains('cm-lang')) {
      rememberLocale(item);
      closeMenu(false);
      return;
    }
    if (action !== 'switch') closeMenu(false); // 「全部设计」是原生 <a> 导航，不拦截默认行为
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
  };
  root.addEventListener('click', onActionClick);
  sheet?.addEventListener('click', onActionClick);

  /** 中键在新标签页打开语言链接时也记住偏好；不拦截默认行为。 */
  const onAuxClick = (event: MouseEvent) => {
    if (event.button !== 1) return;
    const item =
      event.target instanceof Element ? event.target.closest<HTMLElement>('.cm-lang') : null;
    if (item) rememberLocale(item);
  };
  root.addEventListener('auxclick', onAuxClick);
  sheet?.addEventListener('auxclick', onAuxClick);

  // Web Share 不支持 → 移除「分享页面」，菜单里不存在点了没反应的项
  if (typeof navigator.share !== 'function') {
    for (const host of [root, sheet]) {
      host
        ?.querySelectorAll<HTMLElement>('[data-cm-action="share"]')
        .forEach((node) => node.remove());
    }
  }

  if (localeVariant) {
    config = {
      ...config,
      switcherHref: localeVariant.switcherHref,
      shareTitle: localeVariant.shareTitle,
      targets: localeVariant.targets,
      toast: localeVariant.toast,
      launcherLabel: localeVariant.launcherLabel,
      menuLabel: localeVariant.menuLabel,
      closeLabel: localeVariant.closeLabel,
      cancel: localeVariant.cancel,
      languages: localeVariant.languages,
    };
    applyMenuLocale(localeVariant);
  }

  // 首次进入：按判定结果落定形态（无 JS 时两份 DOM 都在，见 SSR 说明）
  applyMode();
}
