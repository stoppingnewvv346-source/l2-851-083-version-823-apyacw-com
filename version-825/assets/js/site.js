(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (toggle && mobilePanel) {
      toggle.addEventListener("click", function () {
        var isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        mobilePanel.hidden = isOpen;
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function startCarousel() {
      if (slides.length < 2) {
        return;
      }
      stopCarousel();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopCarousel() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (slides.length) {
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startCarousel();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startCarousel();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startCarousel();
        });
      }
      startCarousel();
    }

    var searchBox = document.querySelector(".category-search");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-buttons button"));
    var filterItems = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
    var activeFilter = "all";

    function applyFilters() {
      var query = normalize(searchBox ? searchBox.value : "");
      var visibleCount = 0;

      filterItems.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-genre"),
          item.getAttribute("data-year"),
          item.getAttribute("data-region")
        ].join(" "));
        var genre = normalize(item.getAttribute("data-genre"));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchFilter = activeFilter === "all" || genre.indexOf(normalize(activeFilter)) !== -1;
        var visible = matchQuery && matchFilter;
        item.classList.toggle("is-filtered-out", !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      var holder = document.querySelector(".category-movie-grid") || document.querySelector(".full-ranking");
      var empty = document.querySelector(".empty-state");
      if (holder && !visibleCount) {
        if (!empty) {
          empty = document.createElement("div");
          empty.className = "empty-state";
          empty.textContent = "没有找到匹配影片";
          holder.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    }

    if (searchBox && filterItems.length) {
      searchBox.addEventListener("input", applyFilters);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        filterButtons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        activeFilter = button.getAttribute("data-filter") || "all";
        applyFilters();
      });
    });

    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var title = document.getElementById("search-title");

    function createSearchCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return [
        "<article class=\"movie-card\">",
        "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
        "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "<span class=\"poster-shade\"></span>",
        "<span class=\"play-badge\">▶</span>",
        "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>",
        "</a>",
        "<div class=\"movie-info\">",
        "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "<p class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</p>",
        "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>",
        "<div class=\"tag-row\">" + tags + "</div>",
        "</div>",
        "</article>"
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function renderSearch(query) {
      if (!results || typeof SEARCH_MOVIES === "undefined") {
        return;
      }

      var term = normalize(query);
      if (!term) {
        if (title) {
          title.textContent = "精选影片";
        }
        return;
      }

      var found = SEARCH_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        return haystack.indexOf(term) !== -1;
      }).slice(0, 120);

      if (title) {
        title.textContent = "搜索结果";
      }

      if (input) {
        input.value = query;
      }

      results.innerHTML = found.length
        ? found.map(createSearchCard).join("")
        : "<div class=\"empty-state\">没有找到匹配影片</div>";
    }

    if (results && typeof URLSearchParams !== "undefined") {
      var params = new URLSearchParams(window.location.search);
      renderSearch(params.get("q") || "");
    }
  });

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById("main-video");
    var overlay = document.querySelector(".player-overlay");
    var started = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
      return;
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function start() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.src = sourceUrl;
        }
      }

      playVideo();
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
