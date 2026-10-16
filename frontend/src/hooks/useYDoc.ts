import { useMemo, useEffect } from 'react';
import * as Y from 'yjs';

export function useYDoc(roomId: string): Y.Doc {
    const ydoc = useMemo(() => {
        return new Y.Doc();
    }, [roomId]);

    useEffect(() => {
        return () => {
            ydoc.destroy();
        };
    }, [ydoc]);

    return ydoc;
}