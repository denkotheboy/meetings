import { Subject } from "rxjs";

export class RTC {
  private _peerConnection: RTCPeerConnection;

  private _stream$ = new Subject<readonly MediaStream[]>();
  stream$ = this._stream$.asObservable();

  private _ice$ = new Subject<RTCIceCandidate>();
  ice$ = this._ice$.asObservable();

  constructor() {
    this._peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
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
  }

  createOffer(options?: RTCOfferOptions) {
    return this._peerConnection.createOffer(options);
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
    return this._peerConnection.addIceCandidate(candidate);
  }
}
