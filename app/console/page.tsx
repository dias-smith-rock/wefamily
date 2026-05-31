"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ConsoleLayout } from "./components/console-layout";
import { useConsoleAuth } from "./hooks/use-console-auth";
import {
  pickInitialHouseholdId,
  setSelectedHouseholdId,
} from "./lib/household-preference";
import { fetchHouseholdOptionsForUser } from "./lib/membership-query";
import type { ConsoleUser, HouseholdOption } from "./types";
import { requireAuthenticatedSession } from "@/lib/auth/require-session";
import { LANDINGPAGE_CONSOLE_HREF, PRODUCT_NAME_EN, PRODUCT_NAME_ZH } from "@/lib/site-urls";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function initialsFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]![0];
    const b = parts[1]![0];
    if (a && b) return (a + b).toUpperCase();
  }
  const single = parts[0] ?? name;
  return single.slice(0, 2).toUpperCase() || "?";
}

function formatRoleLabel(role: string): string {
  const r = role.trim().toLowerCase();
  if (r === "admin" || r === "owner") return "Household Admin";
  if (r === "member") return "Member";
  return role.replace(/_/g, " ") || "Member";
}

function membershipToConsoleUser(
  option: HouseholdOption,
  emailFallback: string | undefined,
): ConsoleUser {
  const member = option.membership;
  const name =
    member.nickname?.trim() ||
    (emailFallback?.includes("@")
      ? emailFallback.split("@")[0]
      : emailFallback) ||
    "Member";
  return {
    name,
    initials: initialsFromDisplayName(name),
    role: formatRoleLabel(member.role),
    avatarUrl: option.avatarUrl,
  };
}

export default function ConsolePage() {
  const { auth, isAuthenticating, authError, signInWithOAuth, signOut, refreshAuth } =
    useConsoleAuth();

  const [householdOptions, setHouseholdOptions] = useState<HouseholdOption[]>(
    [],
  );
  const [selectedHouseholdId, setSelectedHouseholdIdState] = useState<
    string | null
  >(null);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [noMembership, setNoMembership] = useState(false);
  const [membershipQueryError, setMembershipQueryError] = useState<string | null>(
    null,
  );

  const loadHouseholdOptions = useCallback(async (userId: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setHouseholdOptions([]);
      setSelectedHouseholdIdState(null);
      setNoMembership(false);
      setMembershipQueryError(null);
      void refreshAuth();
      return;
    }

    const guard = await requireAuthenticatedSession(supabase);
    if (!guard.ok) {
      void refreshAuth();
      return;
    }

    setMembershipLoading(true);
    setMembershipQueryError(null);

    const { data, error } = await fetchHouseholdOptionsForUser(supabase, userId);

    if (error) {
      setMembershipLoading(false);
      setMembershipQueryError(error);
      setHouseholdOptions([]);
      setSelectedHouseholdIdState(null);
      setNoMembership(false);
      return;
    }

    if (data.length === 0) {
      setMembershipLoading(false);
      setHouseholdOptions([]);
      setSelectedHouseholdIdState(null);
      setNoMembership(true);
      return;
    }

    const initialId = pickInitialHouseholdId(
      userId,
      data.map((o) => o.householdId),
    );

    setMembershipLoading(false);
    setHouseholdOptions(data);
    setSelectedHouseholdIdState(initialId);
    setNoMembership(false);
  }, [refreshAuth]);

  const handleSelectHousehold = useCallback(
    (householdId: string) => {
      if (auth.status !== "authenticated") return;
      setSelectedHouseholdIdState(householdId);
      setSelectedHouseholdId(auth.user.id, householdId);
    },
    [auth],
  );

  useEffect(() => {
    if (auth.status !== "authenticated") {
      setHouseholdOptions([]);
      setSelectedHouseholdIdState(null);
      setNoMembership(false);
      setMembershipQueryError(null);
      setMembershipLoading(false);
      return;
    }
    void loadHouseholdOptions(auth.user.id);
  }, [auth, loadHouseholdOptions]);

  const handleSessionLost = useCallback(() => {
    void refreshAuth();
  }, [refreshAuth]);

  if (auth.status === "loading" || membershipLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F2F2F7] text-gray-500">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        <span className="text-sm font-medium">验证登录状态…</span>
      </div>
    );
  }

  if (auth.status === "config_error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] px-6">
        <div className="max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">
            缺少 Supabase 配置
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            请在 <code className="rounded bg-gray-100 px-1">.env.local</code> 中配置
            NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY。
          </p>
        </div>
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] p-6 font-sans">
        <Link
          href={LANDINGPAGE_CONSOLE_HREF}
          className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-black/5 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          回到官网
        </Link>
        <div className="flex w-full max-w-md flex-col items-center rounded-3xl border border-gray-100 bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
            {PRODUCT_NAME_ZH}
            <span className="text-blue-600">{PRODUCT_NAME_EN}</span>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900">
            登录 Web 控制台
          </h1>
          <p className="mb-6 text-center text-sm leading-relaxed text-gray-500">
            使用 Apple 或 Google 账号登录以查看家庭数据（只读）。
          </p>
          <p className="mb-8 text-center text-xs text-gray-400">
            登录状态保持 10 分钟，超时需重新登录。
          </p>
          {auth.message ? (
            <p className="mb-4 w-full rounded-xl bg-amber-50 px-3 py-2 text-center text-sm text-amber-800">
              {auth.message}
            </p>
          ) : null}
          <div className="w-full space-y-4">
            <button
              type="button"
              onClick={() => void signInWithOAuth("apple")}
              disabled={isAuthenticating}
              className="flex w-full min-h-[44px] items-center justify-center gap-3 rounded-full bg-black px-6 py-3.5 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              <svg
                className="h-5 w-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.24-.86 3.43-.88 1.14-.02 2.83.42 3.86 1.87-3.6 2.2-2.92 6.77.72 8.16-.76 1.95-1.91 3.96-3.09 3.02zm-3.32-14.7c.67-1.15.93-2.31.76-3.41-1.12.16-2.52.88-3.27 1.97-.6.86-.96 2.05-.74 3.12 1.25.1 2.53-.61 3.25-1.68z" />
              </svg>
              {isAuthenticating ? "跳转中…" : "通过 Apple 登录"}
            </button>
            <button
              type="button"
              onClick={() => void signInWithOAuth("google")}
              disabled={isAuthenticating}
              className="flex w-full min-h-[44px] items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <GoogleMark className="h-5 w-5 shrink-0" />
              {isAuthenticating ? "跳转中…" : "通过 Google 登录"}
            </button>
          </div>
          {authError ? (
            <p className="mt-6 text-center text-sm text-red-600">{authError}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (membershipQueryError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F2F2F7] px-6">
        <div className="max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">暂时无法加载家庭信息</h1>
          <p className="mt-3 text-sm text-red-700">{membershipQueryError}</p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-6 min-h-[44px] w-full rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            退出登录
          </button>
        </div>
      </div>
    );
  }

  if (noMembership || !selectedHouseholdId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F2F2F7] px-6">
        <div className="max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">尚未加入家庭</h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            您尚未加入任何家庭，或加入申请正在审批中。请在同圈 iOS
            客户端完成家庭创建或加入。
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-8 min-h-[44px] w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            退出登录
          </button>
        </div>
      </div>
    );
  }

  const selectedOption =
    householdOptions.find((o) => o.householdId === selectedHouseholdId) ??
    householdOptions[0];

  if (!selectedOption) {
    return null;
  }

  const consoleUser = membershipToConsoleUser(
    selectedOption,
    auth.user.email,
  );

  return (
    <ConsoleLayout
      user={consoleUser}
      householdId={selectedOption.householdId}
      householdOptions={householdOptions}
      onSelectHousehold={handleSelectHousehold}
      currentUserId={auth.user.id}
      onSessionLost={handleSessionLost}
      onSignOut={signOut}
    />
  );
}
