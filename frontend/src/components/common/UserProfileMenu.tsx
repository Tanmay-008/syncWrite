import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLogout } from "@/hooks/useLogout";
import { LogOut, Loader2 } from "lucide-react";

interface UserProfileMenuProps {
  size?: "sm" | "md";
}

export function UserProfileMenu({ size = "md" }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { logout, isLoading } = useLogout();

  // Close popup when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const userInitial = (user.userName || user.email || "U").charAt(0).toUpperCase();
  const sizeClasses = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Profile Avatar Icon */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex ${sizeClasses} cursor-pointer items-center justify-center rounded-full bg-slate-900 font-bold text-white shadow-xs ring-2 ring-slate-200 transition-all hover:scale-105 hover:ring-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 select-none`}
        title={user.userName || user.email}
      >
        {userInitial}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-slate-900/5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100 disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
            ) : (
              <LogOut className="h-3.5 w-3.5 text-rose-500" />
            )}
            <span>{isLoading ? "Logging out..." : "Log out"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
