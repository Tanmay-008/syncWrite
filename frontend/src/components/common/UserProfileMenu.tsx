import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { useLogout } from "@/hooks/useLogout";
import { FolderOpen, LogOut, Loader2 } from "lucide-react";

interface UserProfileMenuProps {
  size?: "sm" | "md";
}

export function UserProfileMenu({ size = "md" }: UserProfileMenuProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout, isLoading } = useLogout();

  if (!user) return null;

  const userInitial = (user.userName || user.email || "U").charAt(0).toUpperCase();
  const sizeClasses = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex ${sizeClasses} cursor-pointer items-center justify-center rounded-full bg-slate-900 font-bold text-white shadow-sm ring-2 ring-slate-200 transition-all hover:scale-105 hover:ring-slate-300 focus-visible:ring-2 focus-visible:ring-slate-400 select-none outline-none`}
        title={user.userName || user.email}
      >
        {userInitial}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
      >
        <DropdownMenuLabel className="px-2 py-2">
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-semibold text-slate-900 truncate">
              {user.userName || "User"}
            </span>
            <span className="text-xs text-slate-500 truncate">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1 bg-slate-100" />

        <DropdownMenuItem
          onClick={() => navigate("/documents")}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100"
        >
          <FolderOpen className="h-4 w-4 text-slate-500" />
          <span>Your Documents</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-slate-100" />

        <DropdownMenuItem
          disabled={isLoading}
          onClick={() => logout()}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700 data-disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
          ) : (
            <LogOut className="h-4 w-4 text-rose-500" />
          )}
          <span>{isLoading ? "Signing out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
