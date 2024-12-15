import { webSocket, WebSocketSubject } from "rxjs/webSocket";

export class Ws {
  private _socket: WebSocketSubject<unknown> = webSocket({
    url: `wss://${window.location.host}/ws/`,
    deserializer: (e) => {
      return e.data;
    },
  });
  messages$ = this._socket.asObservable();

  send(msg: any) {
    return this._socket.next(msg);
  }
}
