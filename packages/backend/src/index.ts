import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import https from "https";
import fs from "fs";

const PORT = 8000;
const app = express();

const server = https.createServer(
  {
    key: fs.readFileSync("./localhost+1-key.pem"),
    cert: fs.readFileSync("./localhost+1.pem"),
  },
  app
);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");

  ws.on("message", (message: string) => {
    console.log("Received:", message);
    
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => console.log("Client disconnected"));
});
server.listen(PORT, () => {
  console.log(`Secure server running on wss://localhost:${PORT}`);
});