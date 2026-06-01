import { BRAND_ASSETS } from "@/lib/brand/assets";
import {
  PRODUCT_NAME_EN,
  PRODUCT_NAME_ZH,
} from "@/lib/site-urls";
import {
  isChineseLocale,
  type Locale,
} from "@/lib/i18n/config";

export type ProductLogoVariant = "markWithName" | "mark";

type ProductLogoProps = {
  locale: Locale;
  /** markWithName：图标 + 本地化产品名；mark：仅图标 */
  variant?: ProductLogoVariant;
  className?: string;
  linkStyle?: boolean;
  /** 图标边长（px），默认 32 */
  iconSize?: number;
};

function productName(locale: Locale): string {
  return isChineseLocale(locale) ? PRODUCT_NAME_ZH : PRODUCT_NAME_EN;
}

export function BrandMark({
  size = 32,
  className = "",
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_ASSETS.mark}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${className}`.trim()}
      aria-hidden={title ? undefined : true}
      title={title}
    />
  );
}

export function ProductLogo({
  locale,
  variant = "markWithName",
  className = "",
  linkStyle = false,
  iconSize = 32,
}: ProductLogoProps) {
  const name = productName(locale);

  if (variant === "mark") {
    return (
      <BrandMark
        size={iconSize}
        className={className}
        title={name}
      />
    );
  }

  const colorClass = linkStyle
    ? "text-[#007AFF]"
    : isChineseLocale(locale)
      ? "text-slate-900"
      : "text-blue-600";

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className}`.trim()}
    >
      <BrandMark size={iconSize} />
      <span className={`font-bold tracking-tight ${colorClass}`}>{name}</span>
    </span>
  );
}

export function formatCopyright(copyrightTemplate: string, locale: Locale): string {
  const name = productName(locale);
  return copyrightTemplate.replace(/\{productZh\}\s*\(\{productEn\}\)/, name);
}
