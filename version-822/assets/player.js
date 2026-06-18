(function() {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play-button]');

  if (!video || !button) {
    return;
  }

  var streamUrl = video.getAttribute('data-stream-url');
  var started = false;
  var hlsInstance = null;

  function attachStream() {
    if (started || !streamUrl) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function playMovie() {
    attachStream();
    button.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', playMovie);
  video.addEventListener('click', function() {
    if (video.paused) {
      playMovie();
    }
  });
  video.addEventListener('play', function() {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function() {
    if (!video.ended) {
      button.classList.remove('is-hidden');
    }
  });
  window.addEventListener('pagehide', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
