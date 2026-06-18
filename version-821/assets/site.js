(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var header = document.querySelector('.site-header');
        var button = document.querySelector('.menu-button');
        if (!header || !button) {
            return;
        }
        button.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slider = document.querySelector('.hero-slider');
        if (!slider) {
            return;
        }
        var slides = selectAll('.hero-slide', slider);
        var dots = selectAll('.hero-dot', slider);
        var prev = slider.querySelector('.hero-prev');
        var next = slider.querySelector('.hero-next');
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        start();
    }

    function setupFilters() {
        var panels = selectAll('.filter-panel');
        panels.forEach(function (panel) {
            var scope = panel.closest('main') || document;
            var input = panel.querySelector('.filter-input');
            var selects = selectAll('.filter-select', panel);
            var cards = selectAll('.js-card-grid .movie-card', scope);

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute('data-filter')] = select.value;
                });
                cards.forEach(function (card) {
                    var haystack = card.getAttribute('data-search') || '';
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesType = !filters.type || card.getAttribute('data-type') === filters.type;
                    var matchesYear = !filters.year || card.getAttribute('data-year') === filters.year;
                    card.classList.toggle('is-hidden', !(matchesQuery && matchesType && matchesYear));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
        });
    }

    function setupPlayers() {
        selectAll('.player-shell').forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.play-layer');
            var stream = box.getAttribute('data-stream');
            var hls;
            var attached = false;

            function attach() {
                if (attached || !video || !stream) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                attach();
                video.controls = true;
                if (button) {
                    button.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!attached || video.paused) {
                        play();
                    }
                });
            }
            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
