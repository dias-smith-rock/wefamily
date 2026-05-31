import {
  PRODUCT_NAME_EN,
  PRODUCT_NAME_ZH,
} from "@/lib/site-urls";
import {
  isChineseLocale,
  type Locale,
} from "@/lib/i18n/config";

type ProductLogoProps = {
  locale: Locale;
  className?: string;
  linkStyle?: boolean;
};

export function ProductLogo({
  locale,
  className = "",
  linkStyle = false,
}: ProductLogoProps) {
  const name = isChineseLocale(locale) ? PRODUCT_NAME_ZH : PRODUCT_NAME_EN;
  const colorClass = linkStyle
    ? "text-[#007AFF]"
    : isChineseLocale(locale)
      ? "text-slate-900"
      : "text-blue-600";

  return (
    <span className={`font-bold tracking-tight ${colorClass} ${className}`.trim()}>
      {name}
    </span>
  );
}

export function formatCopyright(copyrightTemplate: string, locale: Locale): string {
  const name = isChineseLocale(locale) ? PRODUCT_NAME_ZH : PRODUCT_NAME_EN;
  return copyrightTemplate.replace(/\{productZh\}\s*\(\{productEn\}\)/, name);
}
