import { SignOutButton } from "./console-sign-out-button";

type ConsoleTabHeaderProps = {
  title: string;
  onSignOut: () => void;
};

/** 家庭 / 我的 等大标题页顶栏 */
export function ConsoleTabHeader({ title, onSignOut }: ConsoleTabHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-[#F2F2F7]/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
      <div className="flex items-end justify-between gap-3">
        <h1 className="min-w-0 flex-1 text-[34px] font-bold leading-tight tracking-tight text-gray-900">
          {title}
        </h1>
        <SignOutButton onSignOut={onSignOut} className="pb-1" />
      </div>
      <div className="mt-3 h-px w-full bg-gray-200/90" role="separator" aria-hidden />
    </header>
  );
}
