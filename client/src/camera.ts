export class Camera {
  private _stream: MediaStream | undefined;

  get tracks() {
    return this._stream?.getTracks();
  }

  async start() {
    this._stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60, max: 60 },
        aspectRatio: 16 / 9,
        facingMode: "user",
      },
      audio: {
        sampleRate: { ideal: 48_000 }, // Частота дискретизации (48 кГц)
        channelCount: { ideal: 2 }, // Стерео
        echoCancellation: true, // Устранение эха
        noiseSuppression: true, // Подавление шума
        autoGainControl: true, // Подавление шума
      },
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
