import { useEffect, useMemo } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface UseWebSocketOptions {
    ydoc: Y.Doc;
    roomId: string;
    serverUrl?: string;
}

export function useWebsocketProvider({
    ydoc,
    roomId,
    serverUrl = 'ws://localhost:1234',
}: UseWebSocketOptions): WebsocketProvider {

    // 1. Memoize the provider instance so it persists across re-renders
    const provider = useMemo(() => {
        return new WebsocketProvider(serverUrl, roomId, ydoc);
    }, [serverUrl, roomId, ydoc]);

    // 2. Cleanup: Destroy provider when component unmounts or room changes
    useEffect(() => {
        return () => {
            provider.destroy();
        };
    }, [provider]);

    // 3. Return the provider so components can use it (fixes TS2355)
    return provider;
}