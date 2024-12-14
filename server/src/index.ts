import Websocket from "ws";

const port = Number(process.env.PORT || 9000);
const wsServer = new Websocket.Server({ port });

console.log(`server started: ${port}`);

wsServer.addListener("connection", (socket) => {
  socket.addListener("message", (message) => {
    // Пересылаем сообщение другому клиенту
    wsServer.clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
