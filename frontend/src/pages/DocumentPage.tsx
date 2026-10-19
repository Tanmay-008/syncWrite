import { SyncWriteEditor } from "@/components/editor/SyncWriteEditor";
import { useParams, Navigate } from "react-router-dom";

export function DocumentPage() {
  const { docId } = useParams<{ docId: string }>();

  if (!docId || docId === "undefined") {
    return <Navigate to="/" replace />;
  }

  return <SyncWriteEditor docId={docId} />;
}
