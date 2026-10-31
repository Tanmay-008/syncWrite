import dotenv from "dotenv";
dotenv.config();
import { WebSocketServer } from "ws";
import { Hocuspocus } from "@hocuspocus/server";
import cookieParser from "cookie-parser";
import { app } from "./app";
import { getChildLogger } from "./utils/logger";
import { connectToDb } from "./db/document.db";
import { verifyAccessToken } from "./service/jwt.service";
import jwt from "jsonwebtoken";

connectToDb();

const logger = getChildLogger("SyncWriteServer");

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = "0.0.0.0";

const parseCookies = cookieParser();

const hocuspocus = new Hocuspocus({
    async onAuthenticate(data) {
        if (!data.context?.user_id) {
            throw new Error("User unauthorized");
        }

        return {
            user_id: data.context.user_id,
        };
    },
    async onConnect(data) {
        logger.info(`Client connected to document room: ${data.documentName}`);
    },
    async onLoadDocument(data) {
        logger.info(`Loading document state from DB for: ${data.documentName}`);
    },
    async onStoreDocument(data) {
        logger.info(`Saving state for room: ${data.documentName} by User: ${data.lastContext?.user_id}`);
    },
    async onDisconnect(data) {
        logger.info(`Client disconnected from room: ${data.documentName}`);
    },
});

const server = app.listen(PORT, HOST, () => {
    logger.info(`Express Server & REST API running on http://${HOST}:${PORT}`);
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request: any, socket, head) => {
    parseCookies(request, {} as any, () => {
        try {
            const token = request.cookies?.accessToken;

            if (!token) {
                logger.warn("WebSocket Upgrade Rejected: No accessToken cookie found");
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
            }

            verifyAccessToken(token)

            const verifiedUser = jwt.decode(token) as { userId: string };

            logger.info(`WebSocket Upgrade Accepted for user: ${verifiedUser?.userId}`);
            wss.handleUpgrade(request, socket, head, (ws) => {
                hocuspocus.handleConnection(ws, request, {
                    user_id: verifiedUser.userId,
                });
            });

        } catch (error: any) {
            logger.warn(`WebSocket Upgrade Rejected: ${error.message}`);
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
        }
    });
});

process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received: closing Express server");
    server.close(() => {
        logger.info("Server closed successfully");
        process.exit(0);
    });
});