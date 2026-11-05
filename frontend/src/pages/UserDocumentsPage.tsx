import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserDocumentsList } from "@/components/landing/UserDocumentsList";
import { CreateDocButton } from "@/components/landing/CreateDocButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useCheckAuth } from "@/hooks/useCheckAuth";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export function UserDocumentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { checkAuth, isLoading } = useCheckAuth(false);

  useEffect(() => {
    const verify = async () => {
      if (!useAuthStore.getState().isAuthenticated) {
        await checkAuth();
      }

      if (!useAuthStore.getState().isAuthenticated) {
        navigate("/signin", { replace: true, state: { from: location } });
      }
    };

    verify();
  }, [checkAuth, navigate, location]);

  const userInitial = (user?.userName || user?.email || "U").charAt(0).toUpperCase();

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="text-sm font-medium">Loading your documents...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative flex min-h-screen flex-col">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="h-8 gap-1.5 rounded-lg px-2 text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">Home</span>
            </Button>
            <div className="h-4 w-px bg-slate-200" />
            <Logo to="/" size={28} />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-medium text-slate-600">
              {user.userName || user.email}
            </span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-xs ring-2 ring-slate-200 select-none"
              title={user.userName || user.email}
            >
              {userInitial}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Your Documents
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back, {user.userName || "User"}! Manage, edit, and collaborate on your documents.
              </p>
            </div>

            <div>
              <CreateDocButton />
            </div>
          </div>

          {/* Documents Grid / Filter List */}
          <UserDocumentsList />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          SyncWrite — Real-time distraction-free collaborative editor.
        </footer>
      </div>
    </div>
  );
}

