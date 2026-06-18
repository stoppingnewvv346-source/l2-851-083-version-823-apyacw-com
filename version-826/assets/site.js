(function () {
  var mobileButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", function () {
      var expanded = mobileButton.getAttribute("aria-expanded") === "true";
      mobileButton.setAttribute("aria-expanded", String(!expanded));
      mobileNav.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var nextButton = document.querySelector(".hero-next");
  var prevButton = document.querySelector(".hero-prev");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function move(step) {
    showSlide(current + step);
  }

  function startTimer() {
    if (slides.length < 2) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      move(1);
    }, 5600);
  }

  if (slides.length) {
    showSlide(0);
    startTimer();

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        move(1);
        startTimer();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        move(-1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startTimer();
      });
    });
  }

  var input = document.querySelector("[data-filter-input]");
  var regionSelect = document.querySelector("[data-filter-region]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var resetButton = document.querySelector("[data-filter-reset]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var empty = document.querySelector(".no-results");

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function updateCards() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(input ? input.value : "");
    var region = normalize(regionSelect ? regionSelect.value : "");
    var year = normalize(yearSelect ? yearSelect.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (region && cardRegion.indexOf(region) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? "none" : "block";
    }
  }

  if (input) {
    input.addEventListener("input", updateCards);
  }

  if (regionSelect) {
    regionSelect.addEventListener("change", updateCards);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", updateCards);
  }

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (input) {
        input.value = "";
      }

      if (regionSelect) {
        regionSelect.value = "";
      }

      if (yearSelect) {
        yearSelect.value = "";
      }

      updateCards();
    });
  }

  updateCards();
})();
