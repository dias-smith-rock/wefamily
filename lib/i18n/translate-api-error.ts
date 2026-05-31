import type { Translator } from "./translate";

const API_MESSAGE_KEYS: Record<string, string> = {
  missingConfig: "console.api.missingConfig",
  pleaseSignIn: "console.api.pleaseSignIn",
  sessionExpired: "console.api.sessionExpired",
  groupNotFound: "console.api.groupNotFound",
  notInGroup: "console.api.notInGroup",
  networkError: "console.api.networkError",
  "缺少 Supabase 配置": "console.api.missingConfig",
  "请先登录": "console.api.pleaseSignIn",
  "登录已过期，请重新登录": "console.api.sessionExpired",
  "未找到群组信息": "console.api.groupNotFound",
  "当前用户不在该群组成员列表中": "console.api.notInGroup",
  "网络异常，请稍后重试": "console.api.networkError",
};

export function translateApiMessage(
  t: Translator,
  message: string | null | undefined,
  fallbackKey = "common.unknownError",
): string {
  if (!message?.trim()) return t(fallbackKey);
  const key = API_MESSAGE_KEYS[message.trim()];
  return key ? t(key) : message;
}

export function translateAuthMessage(
  t: Translator,
  message: string | null | undefined,
): string | undefined {
  if (!message?.trim()) return undefined;
  if (message.includes("过期") || message.includes("expired")) {
    return t("console.auth.sessionExpired");
  }
  return translateApiMessage(t, message, "console.auth.sessionExpired");
}
