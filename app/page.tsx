import Link from "next/link";
import {
  APP_STORE_HREF,
  COMPANY_NAME_EN,
  COMPANY_NAME_ZH,
  CONTACT_EMAIL,
  LANDINGPAGE_CONSOLE_HREF,
  PRODUCT_NAME_EN,
  PRODUCT_NAME_ZH,
  WEB_CONSOLE_HREF,
} from "@/lib/site-urls";

const USE_CASES = [
  {
    icon: "🏠",
    title: "家庭",
    pain: "接送、采购、老人用药散在群聊里，容易遗漏。",
    solution: "主理人建档代管，任务责任到人，全家日程一眼可见。",
  },
  {
    icon: "✈️",
    title: "旅行团",
    pain: "订票订房、集合时间、证件行李，信息总在群里刷过。",
    solution: "行程排进日历，「谁去办」分工清楚，同行成员不必人人装 App。",
  },
  {
    icon: "🎓",
    title: "社团 / 班委",
    pain: "活动筹备事项多，成员参与不均，进度难追踪。",
    solution: "公共待办与个人任务分开管理，筹备分工一目了然。",
  },
  {
    icon: "🏡",
    title: "合租 / 室友",
    pain: "水电缴费、清洁轮换、共同采购，口头约定容易忘。",
    solution: "周期性任务加提醒，室友分工有记录、有责任人。",
  },
  {
    icon: "🚀",
    title: "创业小组",
    pain: "不想上飞书钉钉，但又需要轻量的任务与日程协同。",
    solution: "Web 控制台统筹进度，移动端随时查看，体量刚好够用。",
  },
] as const;

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
            {PRODUCT_NAME_ZH}
            <span className="text-blue-600">{PRODUCT_NAME_EN}</span>
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
            让小圈子协作， <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              不再靠群聊硬撑
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-slate-500 md:text-xl">
            任务、日程、分工、成员档案——家庭、旅行团、社团小组都能用。轻量清晰，不需要全员下载
            App。
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

        {/* 适用场景 */}
        <section className="mx-auto mt-32 max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              适用场景
            </h2>
            <p className="mt-4 text-slate-500">
              凡是有协作需求的紧密小圈子——3 到 20
              人、彼此信任、需要分事排期——都能用同圈理清琐事。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((item) => (
              <div
                key={item.title}
                className="flex flex-col rounded-3xl border border-gray-100 bg-white/90 p-8 shadow-sm backdrop-blur-sm transition hover:border-gray-200/80 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100/90 text-xl">
                  {item.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-slate-400">
                  {item.pain}
                </p>
                <p className="mt-auto text-sm leading-relaxed text-slate-600">
                  {item.solution}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 核心特性 (Bento Box) */}
        <section className="mx-auto mt-32 max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              化繁为简，为小圈子而生
            </h2>
            <p className="mt-4 text-slate-500">
              成员参与门槛不一？我们以此为起点设计产品。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* 特性卡片 1 - 占满两列 */}
            <div className="rounded-3xl border border-gray-100 bg-white/90 p-10 shadow-sm backdrop-blur-sm transition hover:border-gray-200/80 hover:shadow-md md:col-span-2">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/90 text-2xl text-blue-600 backdrop-blur-sm">
                👤
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">
                首创「免下载」成员档案机制
              </h3>
              <p className="text-lg leading-relaxed text-slate-500">
                无需强制每位成员都下载注册 App。主理人可为不参与 App
                的人建立专属档案——长辈、儿童、临时同行者或外部协作者均可纳入。一人即可统筹全圈子的日程与待办，彻底扫除参与门槛。
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
                清晰区分「公共待办」与「个人专属任务」。订酒店、带证件、准备物料、值班轮换——责任到人，进度可查。
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
                深度集成 Apple 原生安全登录。基于现代云原生架构，圈子数据享受端到端加密防护。
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
                  不仅在手机上丝滑操作，更提供 Web
                  网页控制台。在电脑前统筹旅行行程、活动筹备或小组进度，全平台实时互通。
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
              © 2026 {PRODUCT_NAME_ZH} ({PRODUCT_NAME_EN}). All rights reserved.
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
