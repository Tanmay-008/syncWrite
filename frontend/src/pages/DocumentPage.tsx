import { useEffect } from "react";
import { HocuspocusRoom } from "@hocuspocus/provider-react";
import { useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
import { SyncWriteEditor } from "@/components/editor/SyncWriteEditor";
import { useAuthStore } from "@/store/useAuthStore";

export function DocumentPage() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/signin", { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, user, navigate, location]);

  if (!docId || docId === "undefined") {
    return <Navigate to="/" replace />;
  }

  // Prevent rendering room and editor for unauthenticated users
  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-sm text-slate-400">
        Authenticating...
      </div>
    );
  }

  return (
    <HocuspocusRoom
      name={docId}
      flushDelay={100}
      onAuthenticationFailed={({ reason }) => {
        console.warn("Auth failed for room:", docId, reason);
      }}
    >
      <SyncWriteEditor docId={docId} />
    </HocuspocusRoom>
  );
}