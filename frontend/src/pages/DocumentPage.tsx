import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function DocumentPage() {
  const { docId } = useParams<{ docId: string }>();
  const [content, setContent] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      console.log(html);
    },
    editorProps: {
      attributes: {
        class: "w-full focus:outline-none min-h-[60vh] text-base leading-relaxed text-slate-800",
        style: "font-family: 'Geist Variable', sans-serif",
      },
    },
  });

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
      <EditorToolbar editor={editor} />
      <EditorCanvas editor={editor} />
    </div>
  );
}
