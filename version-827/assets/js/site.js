
(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.getElementById("mobileNav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5600);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (slides.length > 1) {
        dots.forEach(function (dot, i) {
          dot.addEventListener("click", function () {
            show(i);
            start();
          });
        });
        if (prev) {
          prev.addEventListener("click", function () {
            show(current - 1);
            start();
          });
        }
        if (next) {
          next.addEventListener("click", function () {
            show(current + 1);
            start();
          });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
      }
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var category = scope.querySelector("[data-filter-category]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (input && query) {
        input.value = query;
      }

      function apply() {
        var q = normalize(input ? input.value : "");
        var c = normalize(category ? category.value : "");
        var t = normalize(type ? type.value : "");
        var y = normalize(year ? year.value : "");

        cards.forEach(function (card) {
          var ok = true;
          var search = normalize(card.getAttribute("data-search"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));

          if (q && search.indexOf(q) === -1) {
            ok = false;
          }
          if (c && cardCategory !== c) {
            ok = false;
          }
          if (t && cardType !== t) {
            ok = false;
          }
          if (y && cardYear !== y) {
            ok = false;
          }
          card.classList.toggle("is-filtered-out", !ok);
        });
      }

      [input, category, type, year].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });

      apply();
    });
  });
})();
