import dotenv from "dotenv";
dotenv.config();
import { WebSocketServer } from "ws";
import { Hocuspocus } from "@hocuspocus/server";
import cookieParser from "cookie-parser";
import { app } from "./app";
import { getChildLogger } from "./utils/logger";
import { connectToDb } from "./db/document.db";
import { verifyAccessToken } from "./service/jwt.service";
import { Logger } from "@hocuspocus/extension-logger";

connectToDb();

const logger = getChildLogger("SyncWriteServer");

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = "0.0.0.0";

const parseCookies = cookieParser();

const hocuspocus = new Hocuspocus({
    extensions: [
        new Logger({
            onChange: false,
            log: (message) => {
                logger.info(message);
            },
        }),
    ],
    async onAuthenticate(data) {
        if (!data.context?.user_id) {
            throw new Error("User unauthorized");
        }

        return {
            user_id: data.context.user_id,
        };
    },
    async onLoadDocument(data) {
        logger.info(`Loading document state from DB for: ${data.documentName}`);
    },
    async onStoreDocument(data) {
        logger.info(`Saving state for room: ${data.documentName} by User: ${data.lastContext?.user_id}`);
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

            const verifiedUser = verifyAccessToken(token) as { userId: string };

            logger.info(`WebSocket Upgrade Accepted for user: ${verifiedUser?.userId}`);

            wss.handleUpgrade(request, socket, head, (ws) => {
                const protocol = request.headers["x-forwarded-proto"] || "http";
                const host = request.headers.host || `${HOST}:${PORT}`;
                const webRequest = new Request(`${protocol}://${host}${request.url}`, {
                    headers: request.headers as Record<string, string>,
                });

                const clientConnection = hocuspocus.handleConnection(ws, webRequest, {
                    user_id: verifiedUser.userId,
                });

                ws.on("message", (data: Buffer) => {
                    clientConnection.handleMessage(new Uint8Array(data));
                });

                ws.on("close", (code, reason) => {
                    clientConnection.handleClose({
                        code,
                        reason: reason.toString(),
                    });
                });

                ws.on("error", (error) => {
                    logger.error(`WebSocket error: ${error.message}`);
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