(function () {
  window.setupPlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var playButton = document.getElementById(config.playButtonId);
    var started = false;
    var hlsInstance = null;

    if (!video || !config.source) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function attachSource() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(config.source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = config.source;
      }
    }

    function playVideo() {
      attachSource();
      hideOverlay();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    if (playButton) {
      playButton.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", hideOverlay);

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
