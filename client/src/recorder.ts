export class Recorder {
  private _mediaRecorder: MediaRecorder;
  private _recordedChunks: Blob[] = [];

  constructor(stream: MediaStream) {
    const mimeType = this._supported();
    this._mediaRecorder = new MediaRecorder(stream, {
      mimeType,
    });

    this._mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this._recordedChunks.push(event.data);
      }
    };
  }

  private _supported() {
    const types = [
      "video/webm",
      "audio/webm",
      "video/webm;codecs=vp8",
      "video/webm;codecs=daala",
      "video/webm;codecs=h264",
      "audio/webm;codecs=opus",
      "video/mp4",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
  }

  start() {
    this._mediaRecorder.start();
  }

  stop() {
    return new Promise<Blob>((resolve) => {
      this._mediaRecorder.addEventListener("stop", () => {
        const data = this._recordedChunks;
        const blob = new Blob(data, { type: "video/mp4" });
        this._recordedChunks = [];
        resolve(blob);
      });
      this._mediaRecorder.stop();
    });
  }
}
