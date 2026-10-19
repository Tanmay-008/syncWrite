import { HocuspocusRoom } from "@hocuspocus/provider-react";
import { useParams, Navigate } from "react-router-dom";
import { SyncWriteEditor } from "@/components/editor/SyncWriteEditor";

export function DocumentPage() {
  const { docId } = useParams<{ docId: string }>();

  if (!docId || docId === "undefined") {
    return <Navigate to="/" replace />;
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