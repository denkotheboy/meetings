import { retry } from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";

export class Ws {
  private _socket: WebSocketSubject<unknown> = webSocket({
    url: `wss://${window.location.host}/ws/`,
    deserializer: (e) => {
      return e.data;
    },
  });
  messages$ = this._socket.asObservable().pipe(retry({ delay: 5000 }));

  constructor() {
    this._socket.subscribe({
      error: (error) => {
        console.log("ws error", error);
      },
    });
  }

  send(msg: any) {
    return this._socket.next(msg);
  }
}
