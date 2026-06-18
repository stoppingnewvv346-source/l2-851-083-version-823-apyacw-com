(function () {
    function showMessage(box, message) {
        if (!box) {
            return;
        }
        box.textContent = message;
        box.classList.add('show');
    }

    function prepareVideo(video, sourceUrl) {
        if (!sourceUrl) {
            return false;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            return true;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return true;
        }
        return false;
    }

    function bindPlayer(card) {
        var video = card.querySelector('video[data-play-url]');
        var button = card.querySelector('[data-play-button]');
        var message = card.querySelector('[data-player-message]');
        if (!video || !button) {
            return;
        }
        var loaded = false;

        function startPlayback() {
            if (!loaded) {
                loaded = prepareVideo(video, video.getAttribute('data-play-url'));
            }
            if (!loaded) {
                showMessage(message, '播放暂时不可用，请稍后再试');
                return;
            }
            video.controls = true;
            card.classList.add('is-playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    card.classList.remove('is-playing');
                    showMessage(message, '点击播放按钮继续观看');
                });
            }
        }

        button.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
                card.classList.remove('is-playing');
            }
        });
        video.addEventListener('play', function () {
            card.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                card.classList.remove('is-playing');
            }
        });
        video.addEventListener('ended', function () {
            card.classList.remove('is-playing');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var players = document.querySelectorAll('.player-card');
        players.forEach(bindPlayer);
    });
})();
