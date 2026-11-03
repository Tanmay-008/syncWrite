import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Share2, Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getDocumentAccessInfo,
  approveDocumentAccess,
  rejectDocumentAccess,
  type PendingUser,
} from "@/api/documentApi";

interface ShareModalProps {
  docId: string;
}

export function ShareModal({ docId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const shareUrl = `${window.location.origin}/document/${docId}`;

  const loadAccessInfo = useCallback(async () => {
    try {
      const info = await getDocumentAccessInfo(docId);
      setIsAuthor(info.isAuthor);
      setPendingUsers(info.pendingUsers || []);
    } catch (err) {
      console.error("Failed to fetch pending requests in share modal", err);
    }
  }, [docId]);

  useEffect(() => {
    loadAccessInfo();
  }, [loadAccessInfo]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      loadAccessInfo();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async (targetUserId: string) => {
    setLoadingAction(`approve-${targetUserId}`);
    try {
      await approveDocumentAccess(docId, targetUserId);
      setPendingUsers((prev) => prev.filter((u) => u.userId !== targetUserId));
    } catch (err) {
      console.error("Failed to approve access", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (targetUserId: string) => {
    setLoadingAction(`reject-${targetUserId}`);
    try {
      await rejectDocumentAccess(docId, targetUserId);
      setPendingUsers((prev) => prev.filter((u) => u.userId !== targetUserId));
    } catch (err) {
      console.error("Failed to reject access", err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-9 relative cursor-pointer gap-2 rounded-lg border-slate-200 text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow"
          />
        }
      >
        <Share2 className="h-4 w-4" />
        Share
        {pendingUsers.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
            {pendingUsers.length}
          </span>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>
            Share this link with collaborators. New users will need your approval to access.
          </DialogDescription>
        </DialogHeader>

        {/* Copy Link Section */}
        <div className="flex items-center gap-2 pt-2">
          <Input
            readOnly
            value={shareUrl}
            className="h-10 rounded-lg bg-slate-50 font-mono text-sm text-slate-600"
            onFocus={(e) => e.target.select()}
          />
          <Button
            onClick={handleCopy}
            size="sm"
            className="h-10 shrink-0 cursor-pointer gap-2 rounded-lg px-4"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Pending Requests for Document Author */}
        {isAuthor && pendingUsers.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Users className="h-3.5 w-3.5 text-slate-500" />
                Access Requests
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                {pendingUsers.length} pending
              </span>
            </div>

            <div className="max-h-52 space-y-2 overflow-y-auto pr-0.5">
              {pendingUsers.map((u) => {
                const isApproving = loadingAction === `approve-${u.userId}`;
                const isRejecting = loadingAction === `reject-${u.userId}`;
                const isBusy = isApproving || isRejecting;

                return (
                  <div
                    key={u.userId}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {u.userName}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">{u.email}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleApprove(u.userId)}
                        className="h-7 cursor-pointer gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs text-white hover:bg-emerald-700"
                      >
                        {isApproving ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => handleReject(u.userId)}
                        className="h-7 cursor-pointer gap-1 rounded-lg border-slate-200 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        {isRejecting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
