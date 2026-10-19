import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { useYDoc } from "@/hooks/useYDoc";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorCanvas } from "@/components/editor/EditorCanvas";

interface SyncWriteEditorProps {
    docId: string;
    userName?: string;
    serverUrl?: string;
}

export function SyncWriteEditor({ docId }: SyncWriteEditorProps) {
    const ydoc = useYDoc(docId);

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

    return (
        <div className="flex h-screen flex-col bg-white">
            <EditorHeader docId={docId} />
            <EditorToolbar editor={editor} />
            <EditorCanvas editor={editor} />
        </div>
    );
}