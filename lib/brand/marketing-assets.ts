/** 落地页营销图路径（放进 public/marketing/ 后即可替换占位） */
export const MARKETING_ASSETS = {
  heroDevices: "/marketing/hero-devices.png",
  guideOverview: "/marketing/guide-overview.png",
  featureCalendar: "/marketing/feature-calendar.png",
  featureTasks: "/marketing/feature-tasks.png",
  featureMembers: "/marketing/feature-members.png",
  featureSync: "/marketing/feature-sync.png",
  appPromo: "/marketing/app-promo.png",
} as const;

export type MarketingAssetKey = keyof typeof MARKETING_ASSETS;
