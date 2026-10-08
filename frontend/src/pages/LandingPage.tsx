import { HeroSection } from "@/components/landing/HeroSection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative">
        <nav className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              SyncWrite
            </span>
          </div>
        </nav>

        <HeroSection />

        {/* Footer */}
        <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
          Built with focus. No distractions.
        </footer>
      </div>
    </div>
  );
}
