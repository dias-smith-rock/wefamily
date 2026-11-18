import fs from "node:fs";
import path from "node:path";

type ImagePlaceholderProps = {
  /** 预期资源路径，便于后续直接替换 */
  assetPath: string;
  /** 给补图的人看的说明；有图时用作 alt */
  brief: string;
  /** 建议尺寸文案，如 1600×1200 */
  sizeHint?: string;
  className?: string;
  aspectClassName?: string;
};

function assetExists(assetPath: string) {
  const relative = assetPath.replace(/^\//, "");
  return fs.existsSync(path.join(process.cwd(), "public", relative));
}

/** 营销图：有真实文件时展示图片，否则显示占位说明 */
export function ImagePlaceholder({
  assetPath,
  brief,
  sizeHint,
  className = "",
  aspectClassName = "aspect-[4/3]",
}: ImagePlaceholderProps) {
  if (assetExists(assetPath)) {
    return (
      <div
        className={`relative ${aspectClassName} w-full overflow-hidden rounded-[28px] bg-[#0B1220] shadow-[0_18px_48px_rgba(255,111,76,0.12)] ring-1 ring-black/5 ${className}`.trim()}
        data-asset={assetPath}
      >
        {/* 使用原生 img：避免 locale middleware / _next/image 干扰 public 营销图 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPath}
          alt={brief}
          className="absolute inset-0 h-full w-full object-contain object-center"
          loading={assetPath.includes("hero") ? "eager" : "lazy"}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex ${aspectClassName} w-full flex-col items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-[#FF6F4C]/35 bg-gradient-to-br from-[#FFF1EB] via-white to-[#FFE8D6] px-6 py-8 text-center shadow-[0_18px_48px_rgba(255,111,76,0.12)] ${className}`.trim()}
      data-asset={assetPath}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,111,76,0.12),transparent_55%)]"
      />
      <p className="relative text-sm font-semibold tracking-wide text-[#FF6F4C]">
        待补截图
      </p>
      <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
        {brief}
      </p>
      {sizeHint ? (
        <p className="relative mt-2 text-xs text-slate-400">{sizeHint}</p>
      ) : null}
      <p className="relative mt-4 font-mono text-[11px] text-slate-400">
        {assetPath}
      </p>
    </div>
  );
}
