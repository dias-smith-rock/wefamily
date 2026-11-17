"use client";

import { useEffect } from "react";
import { useOptionalDictionary } from "@/lib/i18n/dictionary-provider";

type OverlayRootProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** alert = 居中弹窗；sheet = 底部抽屉；action-sheet = 底部操作表 */
  variant?: "alert" | "sheet" | "action-sheet";
};

export function OverlayRoot({
  open,
  onClose,
  children,
  variant = "sheet",
}: OverlayRootProps) {
  const dictionary = useOptionalDictionary();
  const closeLabel = dictionary?.t("common.close") ?? "关闭";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const alignClass =
    variant === "alert"
      ? "items-center justify-center px-6"
      : "items-end justify-center";

  return (
    <div className={`fixed inset-0 z-[100] flex ${alignClass}`}>
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-md"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-lg transition-transform duration-300 ease-out ${
          variant === "alert"
            ? "flex items-center justify-center"
            : variant === "action-sheet"
              ? "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              : "px-0 pb-0"
        }`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`max-h-[min(88dvh,720px)] overflow-y-auto rounded-t-[20px] bg-[#1C1C1E] shadow-2xl ${className}`}
    >
      <div className="flex justify-center pt-2.5 pb-1">
        <div className="h-1 w-9 rounded-full bg-white/20" aria-hidden />
      </div>
      {children}
    </div>
  );
}

export function AlertPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[300px] overflow-hidden rounded-[18px] border border-white/10 bg-[#2C2C2E]/95 shadow-ios-dock backdrop-blur-xl">
      {children}
    </div>
  );
}

export function ActionSheetPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[#2C2C2E]/95 backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}
