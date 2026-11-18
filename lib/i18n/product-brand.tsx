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
export type ProductLogoTone = "default" | "onDark" | "onLight";

type ProductLogoProps = {
  locale: Locale;
  /** markWithName：图标 + 本地化产品名；mark：仅图标 */
  variant?: ProductLogoVariant;
  className?: string;
  linkStyle?: boolean;
  /** 图标边长（px），默认 32 */
  iconSize?: number;
  /** onDark：深色背景上的白字 */
  tone?: ProductLogoTone;
};

function productName(locale: Locale): string {
  return isChineseLocale(locale) ? PRODUCT_NAME_ZH : PRODUCT_NAME_EN;
}

export function BrandMark({
  size = 32,
  className = "",
  title,
  clear = false,
}: {
  size?: number;
  className?: string;
  title?: string;
  clear?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={clear ? BRAND_ASSETS.markClear : BRAND_ASSETS.mark}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-[22%] ${className}`.trim()}
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
  tone = "default",
}: ProductLogoProps) {
  const name = productName(locale);

  if (variant === "mark") {
    return (
      <BrandMark
        size={iconSize}
        className={className}
        title={name}
        clear={tone === "onDark"}
      />
    );
  }

  const colorClass =
    tone === "onDark"
      ? "text-white"
      : tone === "onLight"
        ? "text-slate-900"
        : linkStyle
          ? "text-[#FF6F4C]"
          : "text-slate-900";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <BrandMark size={iconSize} clear={tone === "onDark"} />
      <span className={`font-bold tracking-tight ${colorClass}`}>{name}</span>
    </span>
  );
}

export function formatCopyright(
  copyrightTemplate: string,
  locale: Locale,
): string {
  const name = productName(locale);
  // 中英文同名时只保留一个品牌名，避免 “WeFamily (WeFamily)”
  if (PRODUCT_NAME_ZH === PRODUCT_NAME_EN) {
    return copyrightTemplate
      .replace(/\{productZh\}\s*\(\{productEn\}\)/, name)
      .replace(/\{productZh\}/g, name)
      .replace(/\{productEn\}/g, name);
  }
  return copyrightTemplate
    .replace(/\{productZh\}/g, PRODUCT_NAME_ZH)
    .replace(/\{productEn\}/g, PRODUCT_NAME_EN);
}
