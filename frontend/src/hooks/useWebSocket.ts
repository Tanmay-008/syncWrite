import { useEffect, useCallback } from 'react';
import { wsService } from '../websocket/socket';
import type { SyncWriteMessage } from '../websocket/protocol';

export const useWebSocket = (onMessage?: (msg: SyncWriteMessage) => void) => {
    useEffect(() => {
        wsService.connect().catch(console.error);

        let unsubscribe: (() => void) | undefined;

        if (onMessage) {
            unsubscribe = wsService.subscribe(onMessage);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [onMessage]);

    const sendMessage = useCallback((message: SyncWriteMessage) => {
        wsService.send(message);
    }, []);

    return { sendMessage };
};
