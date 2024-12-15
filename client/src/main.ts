import "./style.css";
import { RTC } from "./rtc.ts";
import { Ws } from "./ws.ts";
// import { Recorder } from "./recorder.ts";
import { Camera } from "./camera.ts";

const video = document.getElementById("video") as HTMLVideoElement;
const video2 = document.getElementById("video2") as HTMLVideoElement;

// const startButton = document.getElementById("start") as HTMLButtonElement;
// const stopButton = document.getElementById("stop") as HTMLButtonElement;

async function init() {
  const ws = new Ws();
  const camera = new Camera();
  const stream = await camera.start();
  // const recorder = new Recorder(stream);
  const rtc = new RTC();

  video.srcObject = stream;

  camera.tracks?.forEach((track) => {
    console.log(track);
    rtc.addTrack(track, stream);
  });

  rtc.ice$.subscribe((candidate) => {
    ws.send({ candidate });
  });

  rtc.stream$.subscribe((stream) => {
    video2.srcObject = stream[0];
  });

  ws.messages$.subscribe(async (message) => {
    let data: any;
    console.log("message", message);
    if (typeof message === "string") {
      data = JSON.parse(message);
    } else if (message instanceof Blob) {
      data = JSON.parse(await message.text());
    }

    console.log("data", data, typeof data);

    if (data.sdp) {
      console.log("sdp", data.sdp);
      void rtc.setRemoteDescription(rtc.createRTCSessionDescription(data.sdp));
    } else if (data.candidate) {
      console.log("candidate", data.candidate);
      void rtc.addIceCandidate(rtc.createRTCIceCandidate(data.candidate));
    }
  });

  rtc.createOffer().then((offer) => {
    rtc.setLocalDescription(offer);
    ws.send({ sdp: offer });
  });

  // startButton.addEventListener("click", () => {
  //   startButton.disabled = true;
  //   stopButton.disabled = false;
  //   recorder.start();
  // });
  //
  // stopButton.addEventListener("click", () => {
  //   stopButton.disabled = true;
  //   startButton.disabled = false;
  //   // recorder.stop().then((blob) => {
  //   //   socket.send(blob);
  //   // });
  // });
}

void init();
