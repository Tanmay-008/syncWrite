import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import type * as Y from "yjs";

interface UseTipTapEditorOptions {
  ydoc: Y.Doc;
}

export function useTipTapEditor({ ydoc }: UseTipTapEditorOptions) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          undoRedo: false,
        }),
        Collaboration.configure({
          document: ydoc,
        }),
      ],
      editorProps: {
        attributes: {
          class:
            "w-full focus:outline-none min-h-[60vh] text-base leading-relaxed text-slate-800",
          style: "font-family: 'Geist Variable', sans-serif",
        },
      },
    },
    [ydoc]
  );

  return editor;
}
