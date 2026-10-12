/**
 * 共享文案按语言取用的唯一入口（SPEC §5.5）。
 *
 * - 页面与运行时组件都通过它取当前语言的文案，避免各自 import 整个字典后
 *   再做类型断言或 `?? zhCN` 静默回退（静默回退会在缺键时把错误语言的文案
 *   悄悄显示出来，正是本项目要避免的）。
 * - 缺键在**构建期**即抛错：语言集合由 site.config.yaml 校验过，
 *   缺字典或缺键都会让构建失败，而不是上线后才发现。
 */
import { messages, type LocaleMessages } from './messages';

export function sharedMessagesFor(code: string): LocaleMessages {
  const found = messages[code as keyof typeof messages];
  if (!found) {
    throw new Error(
      `[senrenbanka] 语言 "${code}" 缺少共享文案字典。现有：${Object.keys(messages).join(', ')}`,
    );
  }
  return found;
}

export type { LocaleMessages };