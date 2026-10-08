import type { SyncWriteMessage } from './protocol';

type MessageHandler = (message: SyncWriteMessage) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private url: string;
    private handlers: Set<MessageHandler> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout = 1000;
    private connectionPromise: Promise<void> | null = null;

    constructor(url: string) {
        this.url = url;
    }

    connect(): Promise<void> {
        if (this.connectionPromise) return this.connectionPromise;

        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    console.log('WebSocket connected to', this.url);
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message: SyncWriteMessage = JSON.parse(event.data);
                        this.handlers.forEach(handler => handler(message));
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.ws = null;
                    this.connectionPromise = null;
                    this.handleReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting in ${this.reconnectTimeout}ms... (Attempt ${this.reconnectAttempts})`);
            setTimeout(() => {
                this.connect().catch(console.error);
            }, this.reconnectTimeout * this.reconnectAttempts);
        } else {
            console.error('Max reconnect attempts reached. Could not connect to WebSocket.');
        }
    }

    send(message: SyncWriteMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('Cannot send message, WebSocket is not open');
        }
    }

    subscribe(handler: MessageHandler) {
        this.handlers.add(handler);
        return () => {
            this.handlers.delete(handler);
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Singleton instance connecting to localhost:4000
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';
export const wsService = new WebSocketService(WS_URL);
