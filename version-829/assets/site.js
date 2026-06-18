(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    if (menuButton) {
      menuButton.addEventListener('click', function () {
        document.body.classList.toggle('nav-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function startTimer() {
        clearInterval(timer);
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var filterGrid = document.querySelector('[data-filterable]');
    var filterInput = document.querySelector('.js-filter-input');
    var filterSelect = document.querySelector('.js-filter-select');
    var emptyState = document.querySelector('.empty-state');

    if (filterGrid && filterInput) {
      var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (query) {
        filterInput.value = query;
      }

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function applyFilter() {
        var keyword = normalize(filterInput.value);
        var year = filterSelect ? normalize(filterSelect.value) : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search-text'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !year || cardYear === year;
          var isVisible = matchKeyword && matchYear;
          card.classList.toggle('hidden-by-filter', !isVisible);
          if (isVisible) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      filterInput.addEventListener('input', applyFilter);
      if (filterSelect) {
        filterSelect.addEventListener('change', applyFilter);
      }
      applyFilter();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var playButton = player.querySelector('.play-layer');
      var videoUrl = player.getAttribute('data-video');
      var hls = null;
      var attached = false;

      function requestPlay() {
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
          playTask.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      function attachVideo() {
        if (attached || !videoUrl || !video) {
          return;
        }
        attached = true;
        video.setAttribute('controls', 'controls');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            capLevelToPlayerSize: true,
            startLevel: -1,
            maxBufferLength: 30
          });
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              if (video.paused) {
                requestPlay();
              }
            });
          }
        } else {
          video.src = videoUrl;
        }
      }

      function start() {
        player.classList.add('is-playing');
        attachVideo();
        requestPlay();
      }

      if (playButton) {
        playButton.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  });
})();
