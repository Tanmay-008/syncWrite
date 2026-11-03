import { useEffect, useState, useCallback } from "react";
import {
  HocuspocusProviderWebsocketComponent,
  HocuspocusRoom,
} from "@hocuspocus/provider-react";
import { useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
import { SyncWriteEditor } from "@/components/editor/SyncWriteEditor";
import { useAuthStore } from "@/store/useAuthStore";
import { useCheckAuth } from "@/hooks/useCheckAuth";
import {
  createDocument,
  getDocumentAccessInfo,
  requestDocumentAccess,
  type DocumentAccessInfo,
} from "@/api/documentApi";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  ShieldX,
  Loader2,
  Clock,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  FileQuestion,
  Plus,
  Home,
} from "lucide-react";

const getWsUrl = () => {
  if (import.meta.env.PROD) {
    return "wss://api-syncwrite.tanmayshirbhayye.tech";
  }
  return "ws://localhost:4000";
};

export function DocumentPage() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { checkAuth, isLoading: isAuthLoading } = useCheckAuth(false);

  const [accessState, setAccessState] = useState<
    "checking" | "granted" | "denied" | "rejected" | "not_found"
  >("checking");
  const [accessInfo, setAccessInfo] = useState<DocumentAccessInfo | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Check access permission via REST
  const verifyAccess = useCallback(async () => {
    if (!docId || docId === "undefined") return;

    try {
      setAccessState("checking");
      const info = await getDocumentAccessInfo(docId);
      setAccessInfo(info);

      if (info.hasAccess) {
        setAccessState("granted");
      } else if (info.isRejected) {
        setAccessState("rejected");
      } else {
        setAccessState("denied");
      }
    } catch (err: any) {
      console.error("Failed to check access info", err);
      if (err?.response?.status === 404) {
        setAccessState("not_found");
      } else {
        // Fallback to granted so WebSocket onAuthenticate will do authoritative check
        setAccessState("granted");
      }
    }
  }, [docId]);

  // Authenticate user on mount
  useEffect(() => {
    const verifyUser = async () => {
      if (!useAuthStore.getState().isAuthenticated) {
        await checkAuth();
      }

      if (!useAuthStore.getState().isAuthenticated) {
        navigate("/signin", { replace: true, state: { from: location } });
        return;
      }

      verifyAccess();
    };

    verifyUser();
  }, [checkAuth, navigate, location, verifyAccess]);

  // Auto-poll every 3s when waiting for owner approval
  useEffect(() => {
    const isPending = accessInfo?.isPending || requestSuccess;
    if (accessState !== "denied" || !isPending || !docId) return;

    const interval = setInterval(async () => {
      try {
        const info = await getDocumentAccessInfo(docId);
        if (info.hasAccess) {
          setAccessInfo(info);
          setAccessState("granted");
        } else if (info.isRejected) {
          setAccessInfo(info);
          setAccessState("rejected");
        }
      } catch {
        // silent in background
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [accessState, accessInfo?.isPending, requestSuccess, docId]);

  const handleRequestAccess = async () => {
    if (!docId) return;
    setIsRequesting(true);
    setRequestError(null);

    try {
      await requestDocumentAccess(docId);
      setRequestSuccess(true);
      if (accessInfo) {
        setAccessInfo({ ...accessInfo, isPending: true });
      }
    } catch (err: any) {
      console.error("Failed to request access", err);
      setRequestError(
        err?.response?.data?.message || "Failed to send access request. Please try again."
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCreateNewDocument = async () => {
    try {
      setIsCreatingDoc(true);
      const userId = user?.userId || (user as any)?.id;
      const res = await createDocument("Untitled Document", userId);
      const newDocId = res?.data?._id || res?.data?.id;
      if (newDocId) {
        navigate(`/document/${newDocId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Failed to create document from denied screen", err);
      navigate("/");
    } finally {
      setIsCreatingDoc(false);
    }
  };

  if (!docId || docId === "undefined") {
    return <Navigate to="/" replace />;
  }

  // Loading screen
  if (isAuthLoading || !isAuthenticated || !user || accessState === "checking") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="text-sm font-medium">Verifying document permissions...</span>
      </div>
    );
  }

  // 404: Document Not Found
  if (accessState === "not_found") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-200/50">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <FileQuestion className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Document Not Found</h2>
          <p className="mt-2 text-sm text-slate-600">
            This document may have been deleted or the link is incorrect.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full gap-2 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 403: Access Request Declined by Owner
  if (accessState === "rejected") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-xl shadow-rose-100/50 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner">
            <ShieldX className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800">Access Request Denied</h1>

          <p className="mt-2 text-sm text-slate-600">
            The owner of this document has declined your request to access and edit this document.
          </p>

          <div className="my-6 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-left text-xs text-slate-600 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Document:</span>
              <span className="font-semibold text-slate-800">
                {accessInfo?.documentName || "Untitled Document"}
              </span>
            </div>
            {accessInfo?.author && (
              <div className="flex justify-between">
                <span className="text-slate-400">Owner:</span>
                <span className="font-medium text-slate-700">
                  {accessInfo.author.userName} ({accessInfo.author.email})
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Signed in as:</span>
              <span className="font-medium text-slate-700">{user.email}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-rose-100">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-rose-600">Request Declined</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button
              onClick={handleCreateNewDocument}
              disabled={isCreatingDoc}
              className="gap-2 rounded-xl bg-slate-900 px-5 font-medium text-white shadow-md hover:bg-slate-800"
            >
              {isCreatingDoc ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create New Document
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="gap-2 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Permission Denied / Request Access Screen
  if (accessState === "denied") {
    const isPending = accessInfo?.isPending || requestSuccess;

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800">You need access</h1>

          <p className="mt-2 text-sm text-slate-600">
            Ask for access, or switch to an account with permission to edit this document.
          </p>

          <div className="my-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-left text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Document Name:</span>
              <span className="font-semibold text-slate-800">
                {accessInfo?.documentName || "Untitled Document"}
              </span>
            </div>
            {accessInfo?.author && (
              <div className="flex justify-between">
                <span className="text-slate-400">Owner:</span>
                <span className="font-medium text-slate-700">
                  {accessInfo.author.userName} ({accessInfo.author.email})
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Signed in as:</span>
              <span className="font-medium text-slate-700">{user.email}</span>
            </div>
          </div>

          {requestError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 text-left">
              {requestError}
            </div>
          )}

          {isPending ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-sm font-medium text-amber-800">
                <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Approval Pending — Request sent to the owner</span>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <Button
                  onClick={verifyAccess}
                  className="gap-2 rounded-xl shadow-sm"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  Check Access Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Button
                onClick={handleRequestAccess}
                disabled={isRequesting}
                className="gap-2 rounded-xl bg-slate-900 px-6 font-medium text-white shadow-md hover:bg-slate-800"
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Request Access
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Access Granted -> Render collaborative editor
  return (
    <HocuspocusProviderWebsocketComponent url={getWsUrl()}>
      <HocuspocusRoom
        name={docId}
        flushDelay={100}
        onAuthenticationFailed={({ reason }) => {
          console.warn("Auth failed for room:", docId, reason);
          if (
            typeof reason === "string" &&
            (reason.includes("ACCESS_DENIED") || reason.includes("permission-denied"))
          ) {
            setAccessState("denied");
          }
        }}
      >
        <SyncWriteEditor docId={docId} />
      </HocuspocusRoom>
    </HocuspocusProviderWebsocketComponent>
  );
}
