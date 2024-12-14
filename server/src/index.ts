import { readFileSync } from "node:fs";
import path from "node:path";
import Websocket from "ws";
import { createServer } from "https";

const server = createServer({
  cert: readFileSync(path.resolve(__dirname, "./cert.pem")),
  key: readFileSync(path.resolve(__dirname, "./key.pem")),
});
const wsServer = new Websocket.Server({ server });

const port = process.env.PORT || 9000;
server.listen(port);

console.log(`server started: ${port}`);

let usersCount = 0;

wsServer.addListener("connection", (socket) => {
  console.log("Users connected:", ++usersCount);

  socket.addListener("message", (message) => {
    console.log(message);
    // Пересылаем сообщение другому клиенту
    wsServer.clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  socket.addListener("close", () => {
    console.log("Users connected:", --usersCount);
  });
});
