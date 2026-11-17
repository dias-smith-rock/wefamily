import type { ReactNode } from "react";
import { SignOutButton } from "./console-sign-out-button";

type ConsoleTabHeaderProps = {
  title: string;
  onSignOut: () => void;
  leading?: ReactNode;
};

/** 家庭 / 我的 / 待办 等大标题页顶栏（玻璃拟态） */
export function ConsoleTabHeader({
  title,
  onSignOut,
  leading,
}: ConsoleTabHeaderProps) {
  return (
    <header className="sticky top-0 z-20 px-4 pb-3 pt-[max(0.55rem,env(safe-area-inset-top))]">
      {leading ? <div className="mb-3">{leading}</div> : null}
      <div className="flex items-end justify-between gap-3">
        <h1 className="min-w-0 flex-1 text-[32px] font-bold leading-tight tracking-tight text-white">
          {title}
        </h1>
        <SignOutButton
          onSignOut={onSignOut}
          className="pb-1 text-[#FF6B6B]"
        />
      </div>
      <div
        className="mt-3 h-px w-full bg-white/15"
        role="separator"
        aria-hidden
      />
    </header>
  );
}
