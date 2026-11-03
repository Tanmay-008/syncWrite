import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ChevronLeft, Pencil, Check, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CollaboratorAvatars,
  type Collaborator,
} from "./CollaboratorAvatars";
import { ShareModal } from "./ShareModal";
import { ConnectionBadge, type ConnectionStatus } from "./ConnectionBadge";
import {
  getDocumentAccessInfo,
  approveDocumentAccess,
  rejectDocumentAccess,
  type PendingUser,
} from "@/api/documentApi";

interface EditorHeaderProps {
  docId: string;
  status?: ConnectionStatus;
  collaborators?: Collaborator[];
  currentUser?: { name: string; color: string };
}

export function EditorHeader({
  docId,
  status = "connected",
  collaborators = [],
  currentUser,
}: EditorHeaderProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Untitled Document");
  const inputRef = useRef<HTMLInputElement>(null);

  const [isAuthor, setIsAuthor] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAccessInfo = useCallback(async () => {
    try {
      const info = await getDocumentAccessInfo(docId);
      setIsAuthor(info.isAuthor);
      setPendingUsers(info.pendingUsers || []);
      if (info.documentName) {
        setTitle(info.documentName);
      }
    } catch (err) {
      // background poll error silent
    }
  }, [docId]);

  // Initial fetch and polling every 4s for real-time access request alerts
  useEffect(() => {
    loadAccessInfo();
    const interval = setInterval(loadAccessInfo, 4000);
    return () => clearInterval(interval);
  }, [loadAccessInfo]);

  const handleApprove = async (targetUserId: string) => {
    setActionLoading(`approve-${targetUserId}`);
    try {
      await approveDocumentAccess(docId, targetUserId);
      setPendingUsers((prev) => prev.filter((u) => u.userId !== targetUserId));
    } catch (err) {
      console.error("Failed to approve access", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (targetUserId: string) => {
    setActionLoading(`reject-${targetUserId}`);
    try {
      await rejectDocumentAccess(docId, targetUserId);
      setPendingUsers((prev) => prev.filter((u) => u.userId !== targetUserId));
    } catch (err) {
      console.error("Failed to reject access", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  return (
    <div className="flex flex-col border-b border-slate-200 bg-white">
      {/* Real-time Author Notification Banner for Access Requests */}
      {isAuthor && pendingUsers.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50/90 px-4 py-2 text-xs text-amber-900 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            </span>
            <Bell className="h-3.5 w-3.5 text-amber-600" />
            <span>
              <strong>{pendingUsers[0].userName}</strong> ({pendingUsers[0].email}) wants access to this document.
              {pendingUsers.length > 1 && (
                <span className="ml-1 font-semibold text-amber-700">
                  (+{pendingUsers.length - 1} more)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={actionLoading === `approve-${pendingUsers[0].userId}`}
              onClick={() => handleApprove(pendingUsers[0].userId)}
              className="h-7 cursor-pointer gap-1 rounded-md bg-emerald-600 px-3 text-xs text-white shadow-xs hover:bg-emerald-700"
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={actionLoading === `reject-${pendingUsers[0].userId}`}
              onClick={() => handleReject(pendingUsers[0].userId)}
              className="h-7 cursor-pointer gap-1 rounded-md border-amber-200 bg-white px-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <X className="h-3.5 w-3.5" />
              Deny
            </Button>
          </div>
        </div>
      )}

      <header className="flex h-14 items-center justify-between px-4">
        {/* Left: Back + Title + Edit Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-8 w-8 cursor-pointer rounded-lg text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="group/title flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-slate-100/80">
            <FileText className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-48 sm:w-60 border-none bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 focus:rounded px-1 -mx-1"
              placeholder="Untitled Document"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleEditClick}
              title="Edit document name"
              className="h-6 w-6 shrink-0 cursor-pointer rounded-md p-1 text-slate-400 opacity-70 transition-all hover:bg-slate-200 hover:text-slate-700 hover:opacity-100 group-hover/title:opacity-100"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Right: Current User Pill + Collaborators + Share + Status */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1.5 pr-3 text-xs text-slate-700 shadow-xs">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs"
                style={{ backgroundColor: currentUser.color }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium max-w-[120px] truncate">
                {currentUser.name} <span className="text-slate-400 font-normal">(You)</span>
              </span>
            </div>
          )}
          <ConnectionBadge status={status} />
          <Separator orientation="vertical" className="h-6" />
          <CollaboratorAvatars collaborators={collaborators} />
          <ShareModal docId={docId} />
        </div>
      </header>
    </div>
  );
}
