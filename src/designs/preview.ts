/**
 * 切换页设计预览的**共享 props 契约**（类型-only，不 import 任何 CSS）。
 *
 * 切换页对每个预览传入同一组 props，各预览按自身视觉语言取舍使用。
 * 这样切换页只需一份渲染逻辑，新增预览不必改动切换页的调用代码。
 *
 * 注意：本文件**只导出类型**。不得在此建立指向任何设计模块（`Page.astro` / `style.css` /
 * `Preview.astro`）的导入边——那正是 docs/rules/pitfalls.md「已知坑」描述的 CSS 聚合陷阱。
 */

export interface PreviewProps {
  /** 当前语言 BCP 47 code（取该设计 `messages.ts` 的对应文案）。 */
  locale: string;
  /** 当前语言的资料姓名。 */
  name: string;
  /** 当前语言的资料副标题（可选；各设计按需呈现）。 */
  headline?: string;
  /** 当前语言的资料所在地（可选）。 */
  location?: string;
  /** 当前语言的资料链接（预览通常只取前若干条做条目形态引述）。 */
  links?: Array<{ label: string; url: string }>;
}
