import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = '0.0.0.0';

import { WebSocketServer, WebSocket } from "ws";
import { getChildLogger } from "./utils/logger";
import { SyncWriteMessage } from "./websocket/protocol";

import { connectToDb } from "./db/document.db";
connectToDb();


const wsLogger = getChildLogger("WebSocketServer");

const server = app.listen(PORT, HOST, () => {
    wsLogger.info(`Server is running on port:${PORT}`);
});

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}

const wss = new WebSocketServer({ server });
const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB

const sendError = (ws: ExtWebSocket, message: string, code?: string) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'error', message, code }));
    }
};

wss.on("connection", (ws: ExtWebSocket) => {
    wsLogger.info("New WebSocket connection established");
    ws.isAlive = true;

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("message", (messageData) => {
        const messageSize = Array.isArray(messageData)
            ? messageData.reduce((acc, buf) => acc + buf.length, 0)
            : (messageData instanceof ArrayBuffer ? messageData.byteLength : messageData.length);

        if (messageSize > MAX_MESSAGE_SIZE) {
            wsLogger.error("Received oversized message, terminating connection");
            ws.terminate();
            return;
        }

        try {
            const messageStr = messageData.toString();
            const message = JSON.parse(messageStr) as Partial<SyncWriteMessage>;

            if (!message || typeof message !== 'object') {
                wsLogger.warn("Invalid message structure: not an object");
                sendError(ws, "Invalid message structure: not an object", "INVALID_FORMAT");
                return;
            }

            if (!message.type) {
                wsLogger.warn("Invalid message structure: missing type field");
                sendError(ws, "Invalid message structure: missing type field", "MISSING_TYPE");
                return;
            }

            if (message.type !== 'error') {
                if (!('docId' in message) || !('clientId' in message) || !('payload' in message)) {
                    wsLogger.warn(`Invalid message structure for type ${message.type}: missing required fields`);
                    sendError(ws, `Missing required fields (docId, clientId, payload) for type ${message.type}`, "MISSING_FIELDS");
                    return;
                }
            }

            wsLogger.debug(`Received valid message of type: ${message.type}`);
        } catch (error) {
            wsLogger.error("Failed to parse incoming WebSocket message, terminating connection", error);
            ws.terminate();
        }
    });

    ws.on("error", (error) => {
        wsLogger.error("WebSocket connection error", error);
    });

    ws.on("close", () => {
        wsLogger.info("WebSocket connection closed, cleaning up");
    });
});

const interval = setInterval(() => {
    wss.clients.forEach((client) => {
        const extWs = client as ExtWebSocket;
        if (extWs.isAlive === false) {
            wsLogger.warn("Dead connection detected, terminating...");
            return extWs.terminate();
        }

        extWs.isAlive = false;
        extWs.ping();
    });
}, 30000);

wss.on("close", () => {
    clearInterval(interval);
    wsLogger.info("WebSocket server closed");
});