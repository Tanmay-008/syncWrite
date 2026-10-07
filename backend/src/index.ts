import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = '0.0.0.0';

import { connectToDb } from "./db/document.db";
import { WebSocketServer, WebSocket } from "ws";

connectToDb();

const server = app.listen(PORT, HOST, () => {
    console.log(`Server is running on port:${PORT}`);
});

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}

const wss = new WebSocketServer({ server });

wss.on("connection", (ws: ExtWebSocket) => {
    console.log("New WebSocket connection established");
    ws.isAlive = true;

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("message", (message) => {
        console.log("Received via WS:", message.toString());
    });

    ws.on("close", () => {
        console.log("WebSocket connection closed");
    });
});

const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        const extWs = ws as ExtWebSocket;
        if (extWs.isAlive === false) {
            console.log("Dead connection detected, terminating...");
            return extWs.terminate();
        }

        extWs.isAlive = false;
        extWs.ping();
    });
}, 30000);

wss.on("close", () => {
    clearInterval(interval);
});