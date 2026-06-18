(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');
  var navSearch = document.querySelector('.nav-search');

  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function() {
      navMenu.classList.toggle('is-open');
      if (navSearch) {
        navSearch.classList.toggle('is-open');
      }
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      current = (next + slides.length) % slides.length;
      slides.forEach(function(slide, index) {
        slide.classList.toggle('is-active', index === current);
      });
      dots.forEach(function(dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
      });
    });

    window.setInterval(function() {
      showSlide(current + 1);
    }, 5600);
  }

  var catalog = document.querySelector('[data-catalog]');
  if (catalog) {
    var searchInput = catalog.querySelector('[data-catalog-search]');
    var cards = Array.prototype.slice.call(catalog.querySelectorAll('[data-card]'));
    var filterButtons = Array.prototype.slice.call(catalog.querySelectorAll('[data-filter]'));
    var activeFilter = 'all';

    function getQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }

    function applyCatalogFilter() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      cards.forEach(function(card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var genreText = card.getAttribute('data-genre') || '';
        var typeText = card.getAttribute('data-type') || '';
        var matchesQuery = !query || searchText.indexOf(query) !== -1;
        var matchesFilter = activeFilter === 'all' || genreText.indexOf(activeFilter) !== -1 || typeText.indexOf(activeFilter) !== -1;
        card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
      });
    }

    if (searchInput) {
      searchInput.value = getQueryFromUrl();
      searchInput.addEventListener('input', applyCatalogFilter);
    }

    filterButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        activeFilter = button.getAttribute('data-filter') || 'all';
        filterButtons.forEach(function(item) {
          item.classList.toggle('is-active', item === button);
        });
        applyCatalogFilter();
      });
    });

    applyCatalogFilter();
  }
})();
