export interface RouterRuntimeConfig {
  mode: 'random' | 'fixed';
  manualSwitch: boolean;
  defaultId: string;
  enabled: string[];
  cacheHours: number;
  avoidRepeat: boolean;
  base: string;
  storageKey: string;
}

export interface SwitcherRuntimeConfig {
  mode: 'random' | 'fixed';
  cacheHours: number;
  storageKey: string;
}

/** 存储键：默认按 base 路径命名空间化，避免同域（如 GitHub Pages 同账号多项目）互相覆盖。 */
export function storageKeyFor(base: string, override?: string | null): string {
  if (override) return override;
  const normalized = base.replace(/^\/+|\/+$/g, '');
  return `senrenbanka.design.v1:${normalized === '' ? 'root' : normalized}`;
}

/** 序列化为可安全内联进 <script> 的 JSON（转义 '<' 防止提前闭合标签）。 */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * 根路径选择逻辑（SPEC §7.2 状态表）：
 * - fixed：有合法手选 → 手选；否则 default（根路径不写存储）
 * - random：存储未过期 → 用存储；否则重随机（avoidRepeat 时排除上次）并写入新窗口
 */
export function renderRouterScript(cfg: RouterRuntimeConfig): string {
  return `(function () {
  var C = ${safeJson(cfg)};
  var now = Date.now();
  var stored = null;
  try { stored = JSON.parse(localStorage.getItem(C.storageKey) || 'null'); } catch (e) { stored = null; }
  if (stored && (typeof stored.designId !== 'string' || !(stored.expiresAt === null || typeof stored.expiresAt === 'number'))) {
    stored = null;
  }
  var valid = !!(stored && C.enabled.indexOf(stored.designId) !== -1);
  var target;
  if (C.mode === 'fixed') {
    // 固定模式：manualSwitch 关闭时不读存储，永远 default（SPEC §7.2）
    target = C.manualSwitch && valid ? stored.designId : C.defaultId;
  } else if (valid && stored.expiresAt > now) {
    target = stored.designId;
  } else {
    var pool = C.enabled.slice();
    if (C.avoidRepeat && stored && pool.length > 1) {
      var filtered = pool.filter(function (d) { return d !== stored.designId; });
      if (filtered.length) pool = filtered;
    }
    target = pool[Math.floor(Math.random() * pool.length)];
    var expiresAt = C.cacheHours > 0 ? now + C.cacheHours * 3600000 : 0;
    try {
      localStorage.setItem(C.storageKey, JSON.stringify({ designId: target, expiresAt: expiresAt }));
    } catch (e) {}
  }
  location.replace(C.base + target + '/');
})();`;
}

/** 切换页：点击写入手选（random → 重开窗口；fixed → 永久记住），无 JS 时仅导航、不持久化。 */
export function renderSwitcherScript(cfg: SwitcherRuntimeConfig): string {
  return `(function () {
  var C = ${safeJson(cfg)};
  try {
    var stored = JSON.parse(localStorage.getItem(C.storageKey) || 'null');
    if (stored && stored.designId) {
      var cur = document.querySelector('[data-design="' + stored.designId + '"]');
      if (cur) cur.setAttribute('data-current', 'true');
    }
  } catch (e) {}
  document.addEventListener('click', function (e) {
    var el = e.target;
    var link = el && el.closest ? el.closest('a[data-design]') : null;
    if (!link) return;
    var id = link.getAttribute('data-design');
    var expiresAt = C.mode === 'random' ? (C.cacheHours > 0 ? Date.now() + C.cacheHours * 3600000 : 0) : null;
    try {
      localStorage.setItem(C.storageKey, JSON.stringify({ designId: id, expiresAt: expiresAt }));
    } catch (err) {}
  });
})();`;
}