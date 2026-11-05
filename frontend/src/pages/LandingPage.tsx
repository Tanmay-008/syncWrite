import { Link } from "react-router-dom";
import { HeroSection } from "@/components/landing/HeroSection";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { useCheckAuth } from "@/hooks/useCheckAuth";
import { Logo } from "@/components/common/Logo";
import { FolderOpen } from "lucide-react";

export function LandingPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { checkAuth } = useCheckAuth(false);

  useEffect(() => {
    if (!user?.userId && !user?.id) {
      checkAuth();
    }
  }, [user, checkAuth]);

  const userInitial = (user?.userName || user?.email || "U").charAt(0).toUpperCase();

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
        <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-20">
          <Logo to="/" size={32} />

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/documents"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-slate-500" />
                  <span>Your Documents</span>
                </Link>

                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-sm ring-2 ring-slate-200 select-none transition-transform hover:scale-105 cursor-default"
                  title={user.userName || user.email}
                >
                  {userInitial}
                </div>
              </div>
            ) : (
              <Link
                to="/signin"
                className="group/btn relative inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Sign in</span>
                <span className="absolute inset-x-0 -bottom-px block h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
              </Link>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <HeroSection />

        {/* Footer */}
        <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
          Built with focus. Real-time collaborative editing.
        </footer>
      </div>
    </div>
  );
}
