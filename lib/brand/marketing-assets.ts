/** 落地页营销图路径（放进 public/marketing/ 后即可替换占位） */
export const MARKETING_ASSETS = {
  heroDevices: "/marketing/hero-devices.jpg",
  guideOverview: "/marketing/guide-overview.jpg",
  featureCalendar: "/marketing/feature-calendar.jpg",
  featureTasks: "/marketing/feature-tasks.jpg",
  featureMembers: "/marketing/feature-members.jpg",
  featureSync: "/marketing/feature-sync.jpg",
  appPromo: "/marketing/app-promo.jpg",
} as const;

export type MarketingAssetKey = keyof typeof MARKETING_ASSETS;
