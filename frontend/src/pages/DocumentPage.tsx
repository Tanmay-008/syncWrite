import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { useWebSocket } from "@/hooks/useWebSocket";

export function DocumentPage() {
  const { docId } = useParams<{ docId: string }>();

  const { sendMessage } = useWebSocket((message) => {
    console.log("Message from server:", message);
  });

  useEffect(() => {
    if (docId) {
      sendMessage({
        type: 'doc:join',
        docId: docId,
        clientId: 'temp-client-id',
        payload: { userName: 'Tanmay' }
      });
    }
  }, [docId, sendMessage]);

  if (!docId) return null;

  return (
    <div className="flex h-screen flex-col bg-white">
      <EditorHeader docId={docId} />
      <EditorToolbar />
      <EditorCanvas />
    </div>
  );
}
