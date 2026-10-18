import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

interface UseIndexedDBProps {
    docId: string;
    ydoc: Y.Doc;
}

export function useIndexedDB({ docId, ydoc }: UseIndexedDBProps) {
    const [isIndexedDBSynced, setIsIndexedDBSynced] = useState(false);

    useEffect(() => {
        if (!docId || !ydoc) return;

        const provider = new IndexeddbPersistence(docId, ydoc);

        const handleSynced = () => {
            setIsIndexedDBSynced(true);
        };

        provider.on('synced', handleSynced);

        return () => {
            provider.off('synced', handleSynced);
            provider.destroy();
        };
    }, [docId, ydoc]);

    return { isIndexedDBSynced };
}