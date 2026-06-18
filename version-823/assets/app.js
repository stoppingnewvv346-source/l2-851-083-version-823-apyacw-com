(function () {
  "use strict";

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");
    var search = document.querySelector(".nav-search");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      if (search) {
        search.classList.toggle("open");
      }
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        play();
      });
    });
    show(0);
    play();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var box = document.querySelector("[data-filter-box]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!box || !grid) {
      return;
    }
    var keyword = box.querySelector("[data-filter-keyword]");
    var type = box.querySelector("[data-filter-type]");
    var year = box.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-filter-card]"));
    var empty = document.querySelector("[data-filter-empty]");
    function apply() {
      var q = normalize(keyword && keyword.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.type,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (t && normalize(card.dataset.type) !== t) {
          ok = false;
        }
        if (y && normalize(card.dataset.year) !== y) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("visible", visible === 0);
      }
    }
    [keyword, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
    apply();
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<a class=\"movie-card\" href=\"./" + escapeHtml(movie.file) + "\">" +
      "<span class=\"card-cover\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"cover-gradient\"></span><span class=\"card-region\">" + escapeHtml(movie.region) + "</span></span>" +
      "<span class=\"card-body\"><strong>" + escapeHtml(movie.title) + "</strong><em>" + escapeHtml(movie.oneLine) + "</em><span class=\"card-meta\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.year) + "</span></span><span class=\"tag-row\">" + tags + "</span></span>" +
      "</a>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = normalize(params.get("q"));
    var input = document.getElementById("searchInput");
    var title = document.getElementById("searchTitle");
    var hint = document.getElementById("searchHint");
    var empty = document.getElementById("searchEmpty");
    if (input) {
      input.value = params.get("q") || "";
    }
    if (!q) {
      if (empty) {
        empty.classList.remove("visible");
      }
      return;
    }
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        movie.summary,
        (movie.tags || []).join(" ")
      ].join(" "));
      return haystack.indexOf(q) !== -1;
    }).slice(0, 160);
    if (title) {
      title.textContent = "搜索结果";
    }
    if (hint) {
      hint.textContent = matches.length ? "已为你找到相关影片" : "没有找到相关影片";
    }
    results.innerHTML = matches.map(movieCard).join("");
    if (empty) {
      empty.classList.toggle("visible", matches.length === 0);
    }
  }

  function playVideo(video) {
    var started = video.play();
    if (started && typeof started.catch === "function") {
      started.catch(function () {});
    }
  }

  window.startMoviePlayer = function (video, overlay, streamUrl) {
    if (!video || !streamUrl) {
      return;
    }
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.src !== streamUrl) {
        video.src = streamUrl;
      }
      playVideo(video);
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsPlayer) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        video._hlsPlayer = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video);
        });
      } else {
        playVideo(video);
      }
      return;
    }
    if (video.src !== streamUrl) {
      video.src = streamUrl;
    }
    playVideo(video);
  };

  onReady(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
}());
