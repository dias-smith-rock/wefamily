import Link from "next/link";

const BRAND = "#007AFF";
const WEB_CONSOLE_HREF = "https://app.wefamily.ai";
const APP_STORE_HREF = "https://apps.apple.com/app/wefamily"; // 替换为实际上架链接

function AppleLogo({ className }: { className?: string }) {
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

export default function Home() {
  return (
    <div className="min-h-dvh bg-[#FAFAFA]">
      {/* 1. Sticky Navbar */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/72 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,box-shadow] duration-300 supports-[backdrop-filter]:bg-white/60">
        <nav
          className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:h-16 sm:px-6 lg:px-8"
          aria-label="主导航"
        >
          <Link
            href="/"
            className="text-[17px] font-bold tracking-tight text-neutral-950"
          >
            WeFamily.ai
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={WEB_CONSOLE_HREF}
              className="rounded-full border border-neutral-300/90 bg-white/50 px-4 py-2 text-[14px] font-semibold text-neutral-800 shadow-sm transition-all duration-300 hover:border-neutral-400 hover:bg-white hover:shadow-md active:scale-[0.98] sm:px-5 sm:py-2.5 sm:text-[15px]"
            >
              Web 登录
            </Link>
            <Link
              href={APP_STORE_HREF}
              className="rounded-full bg-neutral-950 px-4 py-2 text-[14px] font-semibold text-white shadow-sm transition-all duration-300 hover:bg-neutral-800 hover:shadow-md active:scale-[0.98] sm:px-5 sm:py-2.5 sm:text-[15px]"
            >
              获取 App
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* 2. Hero */}
        <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-40"
            aria-hidden
          >
            <div
              className="absolute -left-1/4 top-0 h-[420px] w-[70%] rounded-full blur-3xl"
              style={{
                background: `radial-gradient(ellipse at center, ${BRAND}22 0%, transparent 65%)`,
              }}
            />
          </div>

          <div className="mx-auto max-w-4xl text-center motion-safe:animate-fade-up">
            <h1 className="text-balance-safe text-4xl font-bold leading-[1.08] tracking-tight text-neutral-950 sm:text-5xl sm:leading-[1.06] md:text-6xl md:leading-[1.04]">
              <span className="bg-gradient-to-br from-neutral-950 via-neutral-800 to-[#007AFF] bg-clip-text text-transparent">
                重新定义家庭协作，让爱与秩序并存。
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-600 sm:text-xl sm:leading-relaxed">
              身份档案分离、专属任务追踪、多端实时同步。WeFamily
              是您的下一代智能家庭中枢。
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <a
                href={APP_STORE_HREF}
                className="group inline-flex w-full max-w-[280px] items-center justify-center gap-2.5 rounded-full bg-black px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-black/15 transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-900 hover:shadow-xl active:scale-[0.99] sm:w-auto sm:max-w-none"
              >
                <AppleLogo className="h-6 w-6 shrink-0 opacity-95 transition-transform duration-300 group-hover:scale-105" />
                <span className="leading-tight">
                  Download on the
                  <br />
                  <span className="text-[17px] font-bold tracking-tight">
                    App Store
                  </span>
                </span>
              </a>
              <Link
                href={WEB_CONSOLE_HREF}
                className="inline-flex w-full max-w-[280px] items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3.5 text-[15px] font-semibold text-neutral-900 shadow-sm transition-all duration-300 hover:border-[#007AFF]/40 hover:bg-[#007AFF]/[0.06] hover:text-[#007AFF] hover:shadow-md active:scale-[0.99] sm:w-auto sm:max-w-none"
              >
                进入 Web 控制台
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-5xl motion-safe:animate-fade-in motion-safe:[animation-delay:120ms] motion-safe:opacity-0 motion-safe:[animation-fill-mode:forwards]">
            <div
              className="relative aspect-[21/10] w-full overflow-hidden rounded-3xl border border-neutral-200/80 bg-gradient-to-b from-neutral-100 to-neutral-50 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.12)] transition-transform duration-500 hover:scale-[1.005] sm:aspect-[2/1]"
              role="img"
              aria-label="iPhone 产品展示图占位区域"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-8 text-center">
                <span className="text-sm font-medium uppercase tracking-widest text-neutral-400">
                  Hero Visual
                </span>
                <p className="max-w-md text-base text-neutral-500">
                  宽幅 iPhone 样机大图将放置于此
                  <br />
                  <span className="text-sm text-neutral-400">
                    建议尺寸约 2400×1200，圆角与容器一致
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Bento Features */}
        <section
          id="features"
          className="border-t border-neutral-200/60 bg-white px-5 py-20 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              化繁为简，专为现代家庭打造
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-neutral-600">
              以极简界面承载复杂协作，让每位家人都能轻松上手。
            </p>

            <div className="mt-14 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-4 lg:grid-rows-2 lg:gap-5">
              {/* Card 1 — wide tall */}
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-white to-neutral-50 p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl lg:col-span-2 lg:row-span-2 lg:p-10">
                <div>
                  <span className="inline-flex rounded-full bg-[#007AFF]/10 px-3 py-1 text-xs font-semibold text-[#007AFF]">
                    核心能力
                  </span>
                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 lg:text-3xl">
                    独立档案管理
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-600 lg:text-lg">
                    无需全员注册，一人即可管理长辈与儿童的数字档案。权限清晰、数据隔离，既保护隐私也减轻负担。
                  </p>
                </div>
                <div
                  className="mt-10 h-32 rounded-2xl bg-neutral-100/80 ring-1 ring-inset ring-neutral-200/60 transition-all duration-500 group-hover:bg-[#007AFF]/[0.06] group-hover:ring-[#007AFF]/20 lg:h-40"
                  aria-hidden
                />
              </article>

              {/* Card 2 */}
              <article className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl lg:col-span-2">
                <div>
                  <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                    工作流
                  </span>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl">
                    精准任务流
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 sm:text-base">
                    支持专属任务与公共待办，责任划分清晰。谁该做什么、何时完成，一目了然。
                  </p>
                </div>
                <div
                  className="mt-8 h-24 rounded-2xl bg-gradient-to-r from-neutral-100 to-neutral-50 ring-1 ring-inset ring-neutral-200/60 transition-all duration-500 group-hover:from-[#007AFF]/8 group-hover:to-neutral-50"
                  aria-hidden
                />
              </article>

              {/* Card 3 */}
              <article className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl lg:col-span-2">
                <div>
                  <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                    安全
                  </span>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl">
                    极速安全登录
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 sm:text-base">
                    深度集成 Sign in with Apple
                    与企业级数据保护。一键登录、少记密码，多一分安心。
                  </p>
                </div>
                <div
                  className="mt-8 h-24 rounded-2xl bg-neutral-900/[0.03] ring-1 ring-inset ring-neutral-200/60 transition-all duration-500 group-hover:ring-[#007AFF]/25"
                  aria-hidden
                />
              </article>
            </div>
          </div>
        </section>

        {/* 4. Footer CTA + links */}
        <section className="border-t border-neutral-200/60 bg-neutral-100/80 px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance-safe text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              准备好升级您的家庭协作体验了吗？
            </h2>
            <p className="mt-4 text-neutral-600">
              在 App Store 获取 WeFamily，或通过 Web 控制台管理家庭空间。
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={APP_STORE_HREF}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] hover:bg-neutral-800 active:scale-[0.98]"
              >
                <AppleLogo className="h-5 w-5" />
                前往 App Store 下载
              </a>
              <Link
                href={WEB_CONSOLE_HREF}
                className="text-[15px] font-semibold text-[#007AFF] underline-offset-4 transition-colors hover:text-[#0066D6] hover:underline"
              >
                打开 Web 控制台
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200/80 bg-neutral-50 px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-neutral-500">
            © 2026 WeFamily.ai
          </p>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-neutral-600"
            aria-label="页脚"
          >
            <Link
              href="/privacy"
              className="transition-colors hover:text-[#007AFF]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-[#007AFF]"
            >
              Terms of Service
            </Link>
            <a
              href="mailto:music.player.250617@gmail.com"
              className="transition-colors hover:text-[#007AFF]"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
