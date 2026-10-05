import { useParams } from "react-router-dom";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorCanvas } from "@/components/editor/EditorCanvas";

export function DocumentPage() {
  const { docId } = useParams<{ docId: string }>();

  if (!docId) return null;

  return (
    <div className="flex h-screen flex-col bg-white">
      <EditorHeader docId={docId} />
      <EditorToolbar />
      <EditorCanvas />
    </div>
  );
}
