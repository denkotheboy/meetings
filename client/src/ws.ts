import { webSocket, WebSocketSubject } from "rxjs/webSocket";

type TMessage = Parameters<WebSocket["send"]>[0];

export class Ws {
  private _socket: WebSocketSubject<TMessage> = webSocket(
    `wss://${window.location.host}/ws/`,
  );
  messages$ = this._socket.asObservable();

  send(msg: TMessage) {
    return this._socket.next(msg);
  }
}
