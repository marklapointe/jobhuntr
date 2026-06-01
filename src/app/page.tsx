import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col w-full max-w-3xl flex-col items-center justify-between px-6 py-24 sm:items-start">
        <div className="flex flex-col items-center gap-8 text-center sm:items-start sm:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
            jobhuntr
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            AI-powered job hunting that applies, tracks, and optimizes your applications
            automatically. Land your dream job faster with intelligent agents.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            href="/auth/register"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-black px-8 text-background transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-solid border-black/[.08] px-8 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
          >
            Login
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="mb-4 text-3xl">🤖</div>
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
              AI Agents
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Autonomous agents navigate portals, fill forms, and submit applications
            </p>
          </div>

          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="mb-4 text-3xl">📄</div>
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
              Smart Parsing
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Upload any resume format. We extract, unify, and optimize for ATS
            </p>
          </div>

          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="mb-4 text-3xl">🎯</div>
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
              Best Match
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              AI matches your profile to jobs and optimizes for ATS scoring
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
