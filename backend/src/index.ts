import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = '0.0.0.0';

import { connectToDb } from "./db/document.db";
import { WebSocketServer } from "ws";

connectToDb();

const server = app.listen(PORT, HOST, () => {
    console.log(`Server is running on port:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log("New WebSocket connection established");

    ws.on("message", (message) => {
        console.log("Received via WS:", message.toString());
    });

    ws.on("close", () => {
        console.log("WebSocket connection closed");
    });
});