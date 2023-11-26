// npm
import WebSocket from "ws";
import https from "https";
import { v4 as uuidv4 } from "uuid";

// Components
import memcached from "./Memcached";

type MessageHandlers = {
  newToken: (socket: WebSocket, pcId: string) => void;
};

namespace WS {
  export const wssConnections: { [key: string]: WebSocket.Server } = {};
  export const userConnections: { [key: string]: WebSocket } = {};

  const messageHandlers: MessageHandlers = {
    newToken: (socket: WebSocket, pcId: string) => {
      const newToken = uuidv4();
      memcached.add("WS", newToken, pcId).then(() => {
        socket.send(JSON.stringify({ type: "NEWTOKEN", token: newToken }));
      });
    },
  };

  export function removeUserConnections(id: string) {
    if (userConnections[id]) userConnections[id].close();
    delete userConnections[id];
  }

  export function sendTo(id: string, message: string) {
    if (userConnections[id]) userConnections[id].send(message);
  }

  export function startWS(sslServer: https.Server, customPath: string) {
    if (!wssConnections[customPath]) {
      wssConnections[customPath] = new WebSocket.Server({ noServer: true });
      wssConnections[customPath].setMaxListeners(20);
      wssConnections[customPath].on(
        "connection",
        async (socket: WebSocket, request) => {
          const clientIp = request.socket.remoteAddress!;
          memcached.get("WS", clientIp).then((id) => {
            if (typeof id === "string") removeUserConnections(id);
          });
          const pcId = uuidv4();
          await memcached.set("WS", clientIp, pcId);
          userConnections[pcId] = socket;
          userConnections[pcId].onmessage = (data) => {
            const message = JSON.parse(data.data.toString());
            const messageType = message.type as string | undefined;
            const pcId = message.pcId as string | undefined;
            if (
              !pcId ||
              !messageType ||
              !messageHandlers.hasOwnProperty(messageType) ||
              !(messageType in messageHandlers)
            )
              return;
            const handler =
              messageHandlers[messageType as keyof MessageHandlers];
            handler(userConnections[pcId], pcId);
          };
          const token = uuidv4();
          memcached.set("PUBLIC", token, true);
          userConnections[pcId].send(
            JSON.stringify({
              type: "INITIALIZATION",
              token: token,
              pcId: pcId,
            })
          );
          userConnections[pcId].onclose = () => {
            removeUserConnections(pcId);
            delete userConnections[pcId];
          };
        }
      );
    }

    sslServer.on("upgrade", (request, socket, head) => {
      const pathname = new URL(request.url!, `http://${request.headers.host}`)
        .pathname;
      if (wssConnections[pathname]) {
        wssConnections[pathname].handleUpgrade(request, socket, head, (ws) => {
          wssConnections[pathname].emit("connection", ws, request);
        });
      }
    });
  }
}

export default WS;
