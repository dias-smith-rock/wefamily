import type { ConsoleUser } from "../types";
import { ConsoleTabHeader } from "./console-tab-header";

type MeViewProps = {
  user: ConsoleUser;
  onSignOut: () => void | Promise<void>;
};

export function MeView({ user, onSignOut }: MeViewProps) {
  return (
    <div className="px-4 pt-2">
      <ConsoleTabHeader title="我的" onSignOut={onSignOut} />

      <div className="mt-6 space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-black/5"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                {user.initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[17px] font-semibold text-gray-900">{user.name}</p>
              <p className="mt-0.5 text-[13px] text-gray-400">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-[15px] font-medium text-gray-900">账户与设置</p>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-400">
            完整设置请在 WeFamily iOS 应用中管理。
          </p>
        </div>
      </div>
    </div>
  );
}
