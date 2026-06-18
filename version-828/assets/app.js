(function () {
    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function bindMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
            button.textContent = menu.classList.contains('open') ? '×' : '☰';
        });
    }

    function bindSearchForms() {
        var forms = document.querySelectorAll('[data-search-form]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"], input[type="search"]');
                var query = input ? input.value.trim() : '';
                var target = form.getAttribute('action') || './movies.html';
                if (query) {
                    window.location.href = target + '?q=' + encodeURIComponent(query);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function bindFilters() {
        var list = document.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }
        var keywordInput = document.querySelector('[data-filter-keyword]');
        var genreSelect = document.querySelector('[data-filter-genre]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var clearButton = document.querySelector('[data-filter-clear]');
        var emptyState = document.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-filter-item'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (keywordInput && initialQuery) {
            keywordInput.value = initialQuery;
        }

        function getHaystack(card) {
            return normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(' '));
        }

        function applyFilters() {
            var keyword = normalize(keywordInput ? keywordInput.value : '');
            var genre = normalize(genreSelect ? genreSelect.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = getHaystack(card);
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchGenre = !genre || normalize(card.dataset.genre + ' ' + card.dataset.tags).indexOf(genre) !== -1;
                var matchYear = !year || normalize(card.dataset.year) === year;
                var visible = matchKeyword && matchGenre && matchYear;
                card.classList.toggle('is-hidden', !visible);
                if (visible) {
                    shown += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', shown === 0);
            }
        }

        [keywordInput, genreSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (genreSelect) {
                    genreSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                applyFilters();
            });
        }

        applyFilters();
    }

    function bindSmoothInternalLinks() {
        var links = document.querySelectorAll('a[href^="#"]');
        links.forEach(function (link) {
            link.addEventListener('click', function (event) {
                var target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    event.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindMenu();
        bindSearchForms();
        bindFilters();
        bindSmoothInternalLinks();
    });
})();
