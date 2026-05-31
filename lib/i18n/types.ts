import type zhCN from "@/messages/zh-CN.json";
import type overlay from "@/lib/i18n/overlays/zh-CN.json";

export type Dictionary = typeof zhCN & typeof overlay;

export type UseCaseKey = keyof Dictionary["useCases"]["items"];

export const USE_CASE_KEYS: UseCaseKey[] = [
  "family",
  "travel",
  "club",
  "roommates",
  "startup",
];

export const USE_CASE_ICONS: Record<UseCaseKey, string> = {
  family: "👥",
  travel: "✈️",
  club: "🎓",
  roommates: "🏡",
  startup: "🚀",
};
