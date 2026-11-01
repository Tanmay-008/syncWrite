import { useEffect } from "react";
import {
  HocuspocusProviderWebsocketComponent,
  HocuspocusRoom,
} from "@hocuspocus/provider-react";
import { useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
import { SyncWriteEditor } from "@/components/editor/SyncWriteEditor";
import { useAuthStore } from "@/store/useAuthStore";
import { useCheckAuth } from "@/hooks/useCheckAuth";

const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    console.log("Production");
    return "https://api-syncwrite.tanmayshirbhayye.tech/api/v1";
  }
  console.log("Development");
  return "http://localhost:4000/api/v1";
};

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

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-sm text-slate-400">
        Authenticating...
      </div>
    );
  }

  return (
    <HocuspocusProviderWebsocketComponent url={getBaseUrl()}>
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
