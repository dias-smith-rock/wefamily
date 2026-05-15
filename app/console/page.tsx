"use client";

import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 环境变量（`.env.local`）：
 * NEXT_PUBLIC_SUPABASE_URL
 * NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Supabase Dashboard → Authentication → URL configuration：
 * 请将回调 URL 加入 `https://<你的域名>/console`（与下方 redirectTo 一致）。
 *
 * 数据库：`profiles.household_id`，`tasks` 含 household_id / title / description / completed / due_date
 */

/** Apple Sign in with Apple — Web 端 Services ID（须与 Apple Developer / Supabase 配置一致） */
const APPLE_WEB_SERVICES_ID = "ai.wefamily.app";

type Task = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
};

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

function formatDueDate(iso: string | null): string {
  if (!iso) return "无截止日期";
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function WebConsole() {
  const clientRef = useRef<SupabaseClient | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [configError, setConfigError] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async (supabase: SupabaseClient, uid: string) => {
    setFetchError(null);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", uid)
      .maybeSingle();

    if (profileError) {
      setFetchError(profileError.message);
      setTasks([]);
      return;
    }

    const householdId = profile?.household_id as string | undefined;
    if (!householdId) {
      setTasks([]);
      setFetchError("未找到家庭 ID，请先在 iOS 端完成家庭设置。");
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, description, completed, due_date")
      .eq("household_id", householdId)
      .order("due_date", { ascending: true, nullsFirst: false });

    if (error) {
      setFetchError(error.message);
      setTasks([]);
      return;
    }

    setTasks((data ?? []) as Task[]);
  }, []);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      setConfigError(true);
      setIsLoading(false);
      return;
    }

    if (!clientRef.current) {
      clientRef.current = createClient(url, key, {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
        },
      });
    }

    const supabase = clientRef.current;

    async function hydrate() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await loadTasks(supabase, session.user.id);
      } else {
        setUser(null);
        setTasks([]);
      }
      setIsLoading(false);
    }

    void hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticating(false);
        setAuthError(null);
        setIsLoading(true);
        await loadTasks(supabase, session.user.id);
        setIsLoading(false);
      } else {
        setUser(null);
        setTasks([]);
        setSelectedTask(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadTasks]);

  async function handleLogin(provider: "apple" | "google") {
    const supabase = clientRef.current;
    if (!supabase || isAuthenticating) return;

    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const options: {
        redirectTo: string;
        queryParams?: Record<string, string>;
      } = {
        redirectTo: `${window.location.origin}/console`,
      };

      // 强制使用 Web Services ID，避免 Supabase 在多个 Client ID 时误选第一个（iOS Bundle ID）
      if (provider === "apple") {
        options.queryParams = {
          client_id: APPLE_WEB_SERVICES_ID,
        };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });
      if (error) throw error;
    } catch (err) {
      console.error("登录失败:", err);
      setAuthError("登录请求失败，请稍后重试");
      setIsAuthenticating(false);
    }
  }

  async function handleSignOut() {
    const supabase = clientRef.current;
    if (!supabase) return;
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setTasks([]);
    setSelectedTask(null);
    setIsLoading(false);
  }

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] px-6">
        <div className="max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">
            缺少 Supabase 配置
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            请在项目根目录创建{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
              .env.local
            </code>{" "}
            并配置：
          </p>
          <ul className="mt-4 space-y-2 text-left text-xs text-gray-600">
            <li>
              <code className="break-all">NEXT_PUBLIC_SUPABASE_URL</code>
            </li>
            <li>
              <code className="break-all">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </li>
          </ul>
          <p className="mt-4 text-xs text-gray-400">
            配置后请重新执行{" "}
            <code className="rounded bg-gray-100 px-1">npm run dev</code>
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F2F2F7] text-gray-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        <span className="text-sm font-medium">加载中…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] p-6 font-sans">
        <div className="flex w-full max-w-md flex-col items-center rounded-3xl border border-gray-100 bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
            WeFamily<span className="text-blue-600">.ai</span>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900">
            登录 Web 控制台
          </h1>
          <p className="mb-10 text-center text-sm leading-relaxed text-gray-500">
            使用您在 iOS 客户端绑定的 Apple 或 Google
            账号快捷登录，安全同步您的家庭数据。
          </p>

          <div className="w-full space-y-4">
            <button
              type="button"
              onClick={() => void handleLogin("apple")}
              disabled={isAuthenticating}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-black px-6 py-3.5 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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
              onClick={() => void handleLogin("google")}
              disabled={isAuthenticating}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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

  return (
    <div className="relative min-h-screen bg-[#F2F2F7] pb-28 font-sans text-gray-900">
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/75 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold tracking-tight">
              WeFamily<span className="text-blue-600">.ai</span>
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            退出
          </button>
        </div>

        <div className="border-t border-amber-200/60 bg-amber-50/90 px-4 py-3 text-center backdrop-blur-sm">
          <p className="text-[13px] font-medium leading-snug text-amber-950 sm:text-sm">
            当前为只读预览模式。如需修改任务或管理成员，请使用 WeFamily iOS
            客户端。
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-5 sm:px-5">
        {fetchError ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
            {fetchError}
          </div>
        ) : null}

        <section aria-label="任务列表">
          <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
            家庭任务
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
            {tasks.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-gray-500">
                暂无任务，或尚未同步到当前家庭。
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-gray-50 active:bg-gray-100/80"
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                          task.completed
                            ? "border-green-500/40 bg-green-500 text-white"
                            : "border-gray-300 bg-white text-transparent"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[17px] font-medium leading-snug ${
                            task.completed
                              ? "text-gray-400 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-gray-500">
                          {formatDueDate(task.due_date)}
                        </span>
                      </span>
                      <span
                        className="mt-1.5 shrink-0 text-gray-300"
                        aria-hidden
                      >
                        ›
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <div
        className={`fixed inset-0 z-40 transition ${
          selectedTask ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!selectedTask}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity ${
            selectedTask ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSelectedTask(null)}
          tabIndex={selectedTask ? 0 : -1}
          aria-label="关闭详情"
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-gray-200/80 bg-[#F2F2F7] shadow-2xl transition-transform duration-300 ease-out ${
            selectedTask ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="任务详情"
        >
          {selectedTask ? (
            <>
              <div className="flex items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 py-3 backdrop-blur-md">
                <h2 className="text-[17px] font-semibold">任务详情</h2>
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="rounded-full p-2 text-xl leading-none text-gray-500 transition hover:bg-gray-100"
                  aria-label="关闭"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    标题
                  </p>
                  <p
                    className={`mt-1 text-xl font-bold ${
                      selectedTask.completed ? "text-gray-400 line-through" : ""
                    }`}
                  >
                    {selectedTask.title}
                  </p>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    状态
                  </p>
                  <p className="mt-1 text-[15px] text-gray-800">
                    {selectedTask.completed ? "已完成" : "未完成"}
                  </p>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    截止日期
                  </p>
                  <p className="mt-1 text-[15px] text-gray-800">
                    {formatDueDate(selectedTask.due_date)}
                  </p>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    描述
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-600">
                    {selectedTask.description?.trim()
                      ? selectedTask.description
                      : "（无描述）"}
                  </p>
                </div>
                <p className="mt-4 px-1 text-center text-[12px] text-gray-400">
                  只读预览 · 无法在 Web 端编辑
                </p>
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
