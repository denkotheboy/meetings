export class Camera {
  private _stream: MediaStream | undefined;

  get tracks() {
    return this._stream?.getTracks();
  }

  async start() {
    this._stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    return this._stream;
  }

  stop() {
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = undefined;
    }
  }
}
