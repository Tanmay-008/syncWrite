import { useMemo } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import {
    useHocuspocusProvider,
    useHocuspocusConnectionStatus,
    useHocuspocusSyncStatus,
    useHocuspocusAwareness,
} from "@hocuspocus/provider-react";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import type { ConnectionStatus } from "@/components/editor/ConnectionBadge";
import type { Collaborator } from "@/components/editor/CollaboratorAvatars";
import { getOrCreateUserSession } from "@/utils/userSession";
import { AuthorHighlight } from "@/extensions/AuthorHighlight";

interface SyncWriteEditorProps {
    docId: string;
    userName?: string;
    userColor?: string;
}

export function SyncWriteEditor({
    docId,
    userName: propUserName,
    userColor: propUserColor,
}: SyncWriteEditorProps) {
    const userSession = useMemo(() => {
        const session = getOrCreateUserSession();
        return {
            id: session.id,
            name: propUserName || session.name,
            color: propUserColor || session.color,
        };
    }, [propUserName, propUserColor]);

    const provider = useHocuspocusProvider();
    const status = useHocuspocusConnectionStatus();
    const syncStatus = useHocuspocusSyncStatus();
    const users = useHocuspocusAwareness();

    const ydoc = provider ? provider.document : null;

    const editor = useEditor(
        {
            extensions: [
                StarterKit.configure({ undoRedo: false }),
                AuthorHighlight.configure({
                    authorId: userSession.id,
                    authorName: userSession.name,
                    authorColor: userSession.color,
                }),
                ...(ydoc ? [Collaboration.configure({ document: ydoc })] : []),
                ...(provider
                    ? [
                        CollaborationCaret.configure({
                            provider,
                            user: { name: userSession.name, color: userSession.color },
                        }),
                    ]
                    : []),
            ],
            editorProps: {
                attributes: {
                    class:
                        "w-full focus:outline-none min-h-[60vh] text-base leading-relaxed text-slate-800",
                    style: "font-family: 'Geist Variable', sans-serif",
                },
            },
        },
        [ydoc, provider, userSession.id, userSession.name, userSession.color]
    );

    if (!provider || !ydoc) {
        return (
            <div className="flex h-screen items-center justify-center text-slate-400">
                Connecting to room...
            </div>
        );
    }

    const connectionStatus: ConnectionStatus =
        syncStatus === "syncing"
            ? "syncing"
            : status === "connected"
                ? "connected"
                : "offline";

    const collaborators: Collaborator[] = users.length > 0
        ? users.map((u) => ({
            id: String(u.clientId),
            name: (u.name as string) || "Anonymous",
            color: (u.color as string) || "#6366f1",
            isOnline: true,
        }))
        : [
            {
                id: userSession.id,
                name: userSession.name,
                color: userSession.color,
                isOnline: status === "connected",
            },
        ];

    return (
        <div className="flex h-screen flex-col bg-white">
            <EditorHeader
                docId={docId}
                status={connectionStatus}
                collaborators={collaborators}
                currentUser={{ name: userSession.name, color: userSession.color }}
            />
            <EditorToolbar editor={editor} />
            <div className="flex-1 overflow-y-auto">
                <EditorCanvas editor={editor} />
            </div>
        </div>
    );
}