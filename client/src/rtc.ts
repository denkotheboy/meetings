import { Subject } from "rxjs";

export class RTC {
  private _peerConnection: RTCPeerConnection;

  private _stream$ = new Subject<readonly MediaStream[]>();
  stream$ = this._stream$.asObservable();

  private _ice$ = new Subject<RTCIceCandidate>();
  ice$ = this._ice$.asObservable();

  constructor() {
    this._peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:turn.kondratevs.ru:3478",
          ],
        },
        {
          urls: "turns:turn.kondratevs.ru:5349",
          username: "testuser",
          credential: "testpassword",
        },
      ],
    });

    this._peerConnection.onicecandidate = (event) => {
      const candidate = event.candidate;
      if (candidate) {
        this._ice$.next(candidate);
      }
    };

    this._peerConnection.ontrack = (event) => {
      this._stream$.next(event.streams);
    };

    this._peerConnection.onconnectionstatechange = () => {
      console.log("Connection State:", this._peerConnection.connectionState);
    };

    this._peerConnection.onicecandidateerror = (event) => {
      console.error("ICE Candidate Error:", event);
    };

    this._peerConnection.oniceconnectionstatechange = () => {
      console.log(
        "ICE connection state:",
        this._peerConnection.iceConnectionState,
      );
    };
  }

  get remoteDescription() {
    return this._peerConnection.remoteDescription;
  }

  get localDescription() {
    return this._peerConnection.localDescription;
  }

  createOffer(options?: RTCOfferOptions) {
    return this._peerConnection.createOffer(options);
  }

  createAnswer(options?: RTCAnswerOptions) {
    return this._peerConnection.createAnswer(options);
  }

  createRTCIceCandidate(candidateInitDict?: RTCIceCandidateInit) {
    return new RTCIceCandidate(candidateInitDict);
  }

  createRTCSessionDescription(descriptionInitDict: RTCSessionDescriptionInit) {
    return new RTCSessionDescription(descriptionInitDict);
  }

  addTrack(track: MediaStreamTrack, ...streams: MediaStream[]) {
    return this._peerConnection.addTrack(track, ...streams);
  }

  setRemoteDescription(description: RTCSessionDescriptionInit) {
    return this._peerConnection.setRemoteDescription(description);
  }

  setLocalDescription(description: RTCLocalSessionDescriptionInit) {
    return this._peerConnection.setLocalDescription(description);
  }

  addIceCandidate(candidate: RTCIceCandidateInit) {
    return this._peerConnection
      .addIceCandidate(candidate)
      .catch((error) => console.error("Ошибка добавления кандидата:", error));
  }
}
