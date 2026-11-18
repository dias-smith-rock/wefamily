import type zhCN from "@/messages/zh-CN.json";
import type overlay from "@/lib/i18n/overlays/zh-CN.json";

export type Dictionary = typeof zhCN & typeof overlay;

export type ShowcaseKey = keyof Dictionary["showcases"];

export const SHOWCASE_KEYS: ShowcaseKey[] = [
  "calendar",
  "tasks",
  "members",
  "sync",
];

export type CapabilityKey = keyof Dictionary["capabilities"]["items"];

export const CAPABILITY_KEYS: CapabilityKey[] = [
  "members",
  "sync",
  "lists",
  "privacy",
];

export const CAPABILITY_ICONS: Record<CapabilityKey, string> = {
  members: "👥",
  sync: "🔄",
  lists: "☑️",
  privacy: "🔒",
};
