import dotenv from "dotenv";
dotenv.config();
import { createServer } from "node:http";
import crossws from "crossws/adapters/node";
import { Hocuspocus, type WebSocketLike } from "@hocuspocus/server";
import { app } from "./app";
import { getChildLogger } from "./utils/logger";
import { connectToDb } from "./db/document.db";

connectToDb();

const logger = getChildLogger("SyncWriteServer");

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = '0.0.0.0';

const hocuspocus = new Hocuspocus({
    async onConnect(data) {
        logger.info(`Client connected to document room: ${data.documentName}`);
    },

    // async onAuthenticate(data) {
    //     const { token, documentName } = data;
    //     logger.info(`Authenticating room request for: ${documentName}`);
    // },

    async onLoadDocument(data) {
        const { documentName } = data;
        logger.info(`Loading document state from DB for: ${documentName}`);
    },

    async onStoreDocument(data) {
        const { documentName } = data;
        logger.info(`Saving latest document state for room: ${documentName}`);
    },

    async onDisconnect(data) {
        logger.info(`Client disconnected from room: ${data.documentName}`);
    },
});

const server = createServer(app);

const ws = crossws({
    hooks: {
        open(peer) {
            const clientConnection = hocuspocus.handleConnection(
                peer.websocket as unknown as WebSocketLike,
                peer.request as Request,
                { user_id: 1234 },
            );
            (peer as any)._hocuspocus = clientConnection;
        },
        message(peer, message) {
            (peer as any)._hocuspocus?.handleMessage(message.uint8Array());
        },
        close(peer, event) {
            (peer as any)._hocuspocus?.handleClose({
                code: event.code,
                reason: event.reason,
            });
        },
        error(peer, error) {
            logger.error(`WebSocket error for peer: ${peer.id}`, error);
        },
    },
});

server.on('upgrade', (request, socket, head) => {
    ws.handleUpgrade(request, socket, head);
});

server.listen(PORT, HOST, () => {
    logger.info(`Server & REST API running on http://${HOST}:${PORT}`);
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('Server closed successfully');
        process.exit(0);
    });
});