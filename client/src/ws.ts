import { Subject } from "rxjs";

type TMessage = Parameters<WebSocket["send"]>[0];

export class Ws {
  private _socket: WebSocket;
  private _messages$ = new Subject<TMessage>();
  messages$ = this._messages$.asObservable();

  constructor() {
    this._socket = new WebSocket(`wss://${window.location.host}/api/`);

    this._socket.addEventListener("message", (message) => {
      this._messages$.next(message.data);
    });
  }

  send(msg: TMessage) {
    this._socket.send(msg);
  }
}
