"use client";

import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

/**
 * 环境变量（请在项目根目录 `.env.local` 中配置）：
 * NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 *
 * 数据库约定（可按实际表结构调整字段名）：
 * - `profiles` 表：含 `id`（与 auth.users.id 一致）、`household_id`
 * - `tasks` 表：含 `household_id`、`title`、`description`、`completed`、`due_date`
 */

type Task = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
};

function AppleMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
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
  const [configError, setConfigError] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
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

  async function handleAppleLogin() {
    const supabase = clientRef.current;
    if (!supabase) return;
    setOauthLoading(true);
    setEmailHint(null);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: origin ? `${origin}/` : undefined,
      },
    });
    setOauthLoading(false);
    if (error) setEmailHint(error.message);
  }

  async function handleEmailMagicLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = clientRef.current;
    if (!supabase || !email.trim()) return;
    setEmailSending(true);
    setEmailHint(null);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: origin ? `${origin}/` : undefined,
      },
    });
    setEmailSending(false);
    if (error) {
      setEmailHint(error.message);
      return;
    }
    setEmailHint("登录链接已发送，请查收邮箱（含垃圾邮件箱）。");
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F2F2F7] px-6 py-16">
        <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/80 p-10 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            WeFamily
          </p>
          <h1 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900">
            Web 控制台
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            登录后可只读查看家庭任务
          </p>

          <button
            type="button"
            onClick={() => void handleAppleLogin()}
            disabled={oauthLoading}
            className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-black py-4 text-[17px] font-semibold text-white shadow-lg shadow-gray-300/50 transition hover:bg-gray-900 active:scale-[0.99] disabled:opacity-60"
          >
            <AppleMark className="h-7 w-7" />
            {oauthLoading ? "跳转中…" : "使用 Apple 账号登录"}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/90 px-3 text-gray-400">或使用邮箱</span>
            </div>
          </div>

          <form onSubmit={handleEmailMagicLink} className="space-y-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3.5 text-[15px] text-gray-900 outline-none ring-blue-500/30 transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4"
            />
            <button
              type="submit"
              disabled={emailSending}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 text-[15px] font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {emailSending ? "发送中…" : "发送邮箱登录链接"}
            </button>
          </form>

          {emailHint ? (
            <p className="mt-4 text-center text-sm text-gray-600">{emailHint}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F2F2F7] pb-28 font-sans text-gray-900">
      {/* 顶部导航 */}
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

        {/* 只读提示 */}
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

      {/* 详情侧栏 */}
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
