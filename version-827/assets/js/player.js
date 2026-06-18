
(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("startPlay");
    var shell = document.getElementById("playerShell");
    var loaded = false;
    var hls = null;

    if (!video || !button || !source) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function startPlay() {
      attachSource();
      button.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      startPlay();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlay();
      }
    });

    if (shell) {
      shell.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          startPlay();
        }
      });
    }

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
