import { useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { getOrCreateUserSession, getUserColor } from "@/utils/userSession";
import { AuthorHighlight } from "@/extensions/AuthorHighlight";
import { useAuthStore } from "@/store/useAuthStore";

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
    const navigate = useNavigate();
    const location = useLocation();
    const storeUser = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated || !storeUser) {
            navigate("/signin", { replace: true, state: { from: location } });
        }
    }, [isAuthenticated, storeUser, navigate, location]);

    const userSession = useMemo(() => {
        if (storeUser?.userName) {
            return {
                id: storeUser.userId || "user",
                name: propUserName || storeUser.userName,
                color: propUserColor || getUserColor(storeUser.userName),
            };
        }

        const session = getOrCreateUserSession();
        return {
            id: session.id,
            name: propUserName || session.name,
            color: propUserColor || session.color,
        };
    }, [storeUser, propUserName, propUserColor]);

    const provider = useHocuspocusProvider();
    const status = useHocuspocusConnectionStatus();
    const syncStatus = useHocuspocusSyncStatus();
    const users = useHocuspocusAwareness();

    const ydoc = provider ? provider.document : null;

    useEffect(() => {
        if (provider?.awareness) {
            provider.awareness.setLocalStateField("user", {
                name: userSession.name,
                color: userSession.color,
            });
            provider.awareness.setLocalStateField("name", userSession.name);
            provider.awareness.setLocalStateField("color", userSession.color);
        }
    }, [provider, userSession.name, userSession.color]);

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

    const localClientId = provider.awareness?.clientID;

    // Filter out local user so user only sees other real remote peers in collaborators
    const collaborators: Collaborator[] = users
        .filter((u) => u.clientId !== localClientId)
        .map((u) => {
            const rawUser = (u as any).user || {};
            const name = rawUser.name || (u.name as string) || "Collaborator";
            const color = rawUser.color || (u.color as string) || getUserColor(name);
            return {
                id: String(u.clientId),
                name,
                color,
                isOnline: true,
            };
        });

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