export interface CRDTId {
    clientId: string;
    clock: number;
}

export interface CRDTOperation {
    id: CRDTId;
    originLeft: CRDTId | null;
    originRight: CRDTId | null;
    value: string;
    isDeleted: boolean;
}

export type MessageType =
    | 'doc:join'
    | 'doc:sync'
    | 'crdt:op'
    | 'ui:cursor'
    | 'error';

export type SyncWriteMessage =
    | {
        type: 'doc:join';
        docId: string;
        clientId: string;
        payload: { userName: string };
    }
    | {
        type: 'doc:sync';
        docId: string;
        clientId: string;
        payload: { crdtStateBlob: string | ArrayBuffer };
    }
    | {
        type: 'crdt:op';
        docId: string;
        clientId: string;
        payload: CRDTOperation;
    }
    | {
        type: 'ui:cursor';
        docId: string;
        clientId: string;
        payload: { leftNodeId: CRDTId | null };
    }
    | {
        type: 'error';
        message: string;
        code?: string;
    };
