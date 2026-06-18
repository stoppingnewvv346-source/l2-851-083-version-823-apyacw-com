import { H as Hls } from "./hls-vendor-dru42stk.js";

export function initPlayer(sourceUrl) {
  var video = document.getElementById("movie-player");
  var button = document.getElementById("player-start");

  if (!video || !button || !sourceUrl) {
    return;
  }

  var attached = false;
  var hls = null;

  function attachSource() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          hls = null;
          video.src = sourceUrl;
        }
      });

      return;
    }

    video.src = sourceUrl;
  }

  function beginPlayback() {
    attachSource();
    button.classList.add("is-hidden");
    video.controls = true;
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  button.addEventListener("click", beginPlayback);

  video.addEventListener("click", function () {
    if (video.paused) {
      beginPlayback();
    }
  });
}
