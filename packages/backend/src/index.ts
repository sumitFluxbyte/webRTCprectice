import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import cors from "cors";

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

app.use(cors());

const PORT = process.env.PORT || 5000;

// Create a WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("A user connected");

  ws.on("message", (data) => {
    // Broadcast the received message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on("close", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket signaling server running on port ${PORT}`);
});
