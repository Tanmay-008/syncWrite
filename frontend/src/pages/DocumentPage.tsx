import { useEffect } from "react";
import {
  HocuspocusProviderWebsocketComponent,
  HocuspocusRoom,
} from "@hocuspocus/provider-react";
import { useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
import { SyncWriteEditor } from "@/components/editor/SyncWriteEditor";
import { useAuthStore } from "@/store/useAuthStore";
import { useCheckAuth } from "@/hooks/useCheckAuth";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:4000";

export function DocumentPage() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { checkAuth, isLoading } = useCheckAuth(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (useAuthStore.getState().isAuthenticated) {
        return;
      }

      await checkAuth();

      if (!useAuthStore.getState().isAuthenticated) {
        navigate("/signin", { replace: true, state: { from: location } });
      }
    };

    verifyAuth();
  }, [checkAuth, navigate, location]);

  if (!docId || docId === "undefined") {
    return <Navigate to="/" replace />;
  }

  // Prevent rendering room and editor while verifying or if not authenticated
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-sm text-slate-400">
        Authenticating...
      </div>
    );
  }

  // WebSocket connection sirf tab banti hai jab user authenticated ho
  return (
    <HocuspocusProviderWebsocketComponent url={WS_URL}>
      <HocuspocusRoom
        name={docId}
        flushDelay={100}
        onAuthenticationFailed={({ reason }) => {
          console.warn("Auth failed for room:", docId, reason);
        }}
      >
        <SyncWriteEditor docId={docId} />
      </HocuspocusRoom>
    </HocuspocusProviderWebsocketComponent>
  );
}
