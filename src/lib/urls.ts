/**
 * 站点路径前缀（构建期由 Astro 注入）。
 * 注意：Astro 7 的 import.meta.env.BASE_URL 在带 base 时**不带尾斜杠**（如 '/repo'），
 * 必须归一化为 '/repo/'；根路径时为 '/'（本机实测坑，见 SPEC §3.2-15）。
 */
const rawBase = import.meta.env.BASE_URL;
export const BASE = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

/** 把站内路径拼上 base 前缀；传入 '/designs/' 或 'designs/' 均可。 */
export function withBase(path: string): string {
  return BASE + path.replace(/^\/+/, '');
}