import { useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/core";
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
import { getUserColor } from "@/utils/userSession";
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
        const userName = propUserName || storeUser?.userName || "User";
        return {
            id: (storeUser as any)?.userId || storeUser?.id || "user",
            name: userName,
            color: propUserColor || getUserColor(userName),
        };
    }, [storeUser, propUserName, propUserColor]);

    const provider = useHocuspocusProvider();
    const status = useHocuspocusConnectionStatus();
    const isSynced = useHocuspocusSyncStatus();
    const users = useHocuspocusAwareness();

    const ydoc = provider ? provider.document : null;

    useEffect(() => {
        if (provider?.awareness) {
            provider.awareness.setLocalStateField("user", {
                id: userSession.id,
                name: userSession.name,
                color: userSession.color,
            });
        }
    }, [provider, userSession.id, userSession.name, userSession.color]);

    const editor = useEditor(
        {
            extensions: [
                StarterKit.configure({
                    heading: false,
                    undoRedo: false,
                }),
                Heading.extend({
                    renderHTML({ node, HTMLAttributes }) {
                        const hasLevel = this.options.levels.includes(node.attrs.level);
                        const level = hasLevel ? node.attrs.level : this.options.levels[0];
                        const levelClasses: Record<number, string> = {
                            1: "text-3xl font-bold tracking-tight text-slate-900 mt-6 mb-2.5 block",
                            2: "text-2xl font-bold tracking-tight text-slate-900 mt-5 mb-2 block",
                            3: "text-xl font-semibold tracking-tight text-slate-800 mt-4 mb-1.5 block",
                        };

                        return [
                            `h${level}`,
                            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                                class: levelClasses[level] || "",
                            }),
                            0,
                        ];
                    },
                }).configure({
                    levels: [1, 2, 3],
                }),
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
        [ydoc, provider]
    );

    if (!provider || !ydoc) {
        return (
            <div className="flex h-screen items-center justify-center text-slate-400">
                Connecting to room...
            </div>
        );
    }

    const connectionStatus: ConnectionStatus =
        status === "disconnected"
            ? "offline"
            : status === "connecting" || !isSynced
                ? "syncing"
                : "connected";

    const localClientId = provider.awareness?.clientID;

    const collaborators: Collaborator[] = users
        .filter((u) => u.clientId !== localClientId)
        .map((u) => {
            const rawUser = (u as any).user || {};
            const name = rawUser.name || (u as any).name || "Collaborator";
            const color = rawUser.color || (u as any).color || getUserColor(name);
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