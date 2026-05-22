import Link from "next/link";
import {
  APP_STORE_HREF,
  COMPANY_NAME_EN,
  COMPANY_NAME_ZH,
  CONTACT_EMAIL,
  LANDINGPAGE_CONSOLE_HREF,
  WEB_CONSOLE_HREF,
} from "@/lib/site-urls";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-blue-200/80">
      {/* 导航栏 */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100/90 bg-white/70 backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href={LANDINGPAGE_CONSOLE_HREF}
            className="text-xl font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-80"
          >
            WeFamily<span className="text-blue-600">.ai</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={WEB_CONSOLE_HREF}
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              Web 控制台
            </Link>
            <a
              href={APP_STORE_HREF}
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white shadow-lg shadow-gray-200/80 transition hover:bg-gray-800"
            >
              获取 App
            </a>
          </div>
        </div>
      </header>

      <main className="pb-20 pt-32">
        {/* 英雄首屏 (Hero Section) */}
        <section className="mx-auto max-w-5xl space-y-8 px-6 text-center">
          <h1 className="text-balance text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
            为现代家庭设计的 <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              智能协作中枢
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-slate-500 md:text-xl">
            告别群聊里的凌乱琐事。独创的家庭档案管理与专属任务流，让跨代际的家庭运转如企业般高效，却不失家的温度。
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <a
              href={APP_STORE_HREF}
              className="w-full rounded-full bg-black px-8 py-4 text-center text-lg font-semibold text-white shadow-xl shadow-gray-300/50 transition hover:scale-[1.02] active:scale-[0.99] sm:w-auto"
            >
              在 App Store 下载
            </a>
            <Link
              href={WEB_CONSOLE_HREF}
              className="w-full rounded-full border border-gray-200/90 bg-white/80 px-8 py-4 text-center text-lg font-semibold text-black shadow-sm backdrop-blur-sm transition hover:bg-gray-50/90 sm:w-auto"
            >
              探索 Web 端功能
            </Link>
          </div>

          {/* 视觉占位框 (未来放 3D 手机或 App 截图) */}
          <div className="relative mt-16 flex h-[400px] w-full items-center justify-center overflow-hidden rounded-[2.5rem] border border-gray-200/90 bg-gradient-to-tr from-gray-100 to-gray-50 shadow-2xl shadow-gray-200/60 md:h-[600px]">
            <div className="pointer-events-none absolute inset-0 bg-white/40 backdrop-blur-3xl" />
            <p className="relative z-10 max-w-md px-6 text-center font-medium text-slate-400">
              [ 这里预留放置 App 核心界面的精美截图或 3D 手机模型 ]
            </p>
          </div>
        </section>

        {/* 核心特性 (Bento Box) */}
        <section className="mx-auto mt-32 max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              化繁为简，专为全家打造
            </h2>
            <p className="mt-4 text-slate-500">
              真正考虑到老人与儿童使用痛点的底层架构设计。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* 特性卡片 1 - 占满两列 */}
            <div className="rounded-3xl border border-gray-100 bg-white/90 p-10 shadow-sm backdrop-blur-sm transition hover:border-gray-200/80 hover:shadow-md md:col-span-2">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/90 text-2xl text-blue-600 backdrop-blur-sm">
                👨‍👩‍👧‍👦
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">
                首创「免下载」档案成员机制
              </h3>
              <p className="text-lg leading-relaxed text-slate-500">
                无需强制全家每人都下载注册 App。主理人可为长辈或儿童建立专属的「家庭档案」。一人即可轻松统筹全家人的日程、待办与健康计划，彻底扫除使用门槛。
              </p>
            </div>

            {/* 特性卡片 2 */}
            <div className="rounded-3xl border border-gray-100 bg-white/90 p-10 shadow-sm backdrop-blur-sm transition hover:border-gray-200/80 hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100/90 text-2xl text-indigo-600 backdrop-blur-sm">
                🎯
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                专属任务流转
              </h3>
              <p className="leading-relaxed text-slate-500">
                清晰区分「公共待办」与「个人专属任务」。谁负责接送、谁负责采购，责任到人。
              </p>
            </div>

            {/* 特性卡片 3 */}
            <div className="rounded-3xl border border-gray-100 bg-white/90 p-10 shadow-sm backdrop-blur-sm transition hover:border-gray-200/80 hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100/90 text-2xl text-slate-800 backdrop-blur-sm">
                🔒
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                企业级隐私保护
              </h3>
              <p className="leading-relaxed text-slate-500">
                深度集成 Apple 原生安全登录。基于现代云原生架构，家庭数据享受端到端加密防护。
              </p>
            </div>

            {/* 特性卡片 4 - 占满两列 */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-black p-10 shadow-lg shadow-gray-300/30 md:col-span-2">
              <div className="relative z-10">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm">
                  💻
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  多端无缝同步控制台
                </h3>
                <p className="max-w-md text-lg leading-relaxed text-slate-300">
                  不仅在手机上丝滑操作，更提供专为办公场景打造的 Web 网页控制台。在电脑前也能随时管理家庭日程，全平台实时互通。
                </p>
              </div>
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl" />
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="mt-20 border-t border-gray-100 bg-white/80 py-12 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p className="text-sm text-slate-400">
              © 2026 WeFamily.ai. All rights reserved.
            </p>
            <p className="text-xs text-slate-400/70">
              {COMPANY_NAME_ZH} · {COMPANY_NAME_EN}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-xs text-slate-400/70 transition-colors hover:text-slate-500"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-slate-400">
            <Link
              href="/privacy"
              className="transition-colors hover:text-slate-900"
            >
              隐私政策
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-slate-900"
            >
              服务条款
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="transition-colors hover:text-slate-900"
            >
              联系我们
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
