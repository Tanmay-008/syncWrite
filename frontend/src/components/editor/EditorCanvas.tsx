import { EditorContent, Editor } from "@tiptap/react";

interface EditorCanvasProps {
  editor: Editor | null;
}

export function EditorCanvas({ editor }: EditorCanvasProps) {
  if (!editor) return null;

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
