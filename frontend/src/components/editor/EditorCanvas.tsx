import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface EditorCanvasProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export function EditorCanvas({ initialContent = "", onChange }: EditorCanvasProps = {}) {
  const [content, setContent] = useState(initialContent);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: "w-full focus:outline-none min-h-[60vh] text-base leading-relaxed text-slate-800",
        style: "font-family: 'Geist Variable', sans-serif",
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent !== content) {
    }
  }, [initialContent, editor, content]);

  return (
    <div className="flex-1 bg-slate-50/50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div
          className="min-h-[70vh] rounded-xl border border-slate-200 bg-white px-16 py-12 shadow-sm transition-shadow focus-within:shadow-md cursor-text"
          onClick={() => editor?.commands.focus()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
