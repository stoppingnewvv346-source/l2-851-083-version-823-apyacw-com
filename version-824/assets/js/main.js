const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');

function updateHeader() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 12);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (menuToggle && header) {
  menuToggle.addEventListener('click', () => {
    header.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero]');
if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let current = 0;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroDot || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(() => showSlide(current + 1), 5200);
  }
}

const localFilter = document.querySelector('[data-local-filter]');
const filterGrid = document.querySelector('[data-filter-grid]');
if (localFilter && filterGrid) {
  const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));
  localFilter.addEventListener('input', () => {
    const keyword = localFilter.value.trim().toLowerCase();
    cards.forEach((card) => {
      const haystack = `${card.dataset.title || ''} ${card.dataset.meta || ''}`.toLowerCase();
      card.hidden = keyword !== '' && !haystack.includes(keyword);
    });
  });
}

async function preparePlayer(video) {
  const source = video.dataset.hls;
  if (!source || video.dataset.ready === '1') return;
  video.dataset.ready = '1';

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return;
  }

  try {
    const module = await import('./hls-vendor.js');
    const Hls = module.H;
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }
  } catch (error) {
    video.dataset.ready = '1';
  }

  video.src = source;
}

const video = document.querySelector('video[data-hls]');
const playerCover = document.querySelector('[data-player-cover]');
if (video) {
  const startPlayback = async () => {
    await preparePlayer(video);
    if (playerCover) playerCover.classList.add('is-hidden');
    video.play().catch(() => {
      if (playerCover) playerCover.classList.remove('is-hidden');
    });
  };

  video.addEventListener('play', () => {
    if (playerCover) playerCover.classList.add('is-hidden');
  });

  video.addEventListener('click', () => {
    if (video.paused) startPlayback();
  });

  if (playerCover) {
    playerCover.addEventListener('click', startPlayback);
  }
}

const searchApp = document.querySelector('[data-search-app]');
if (searchApp && Array.isArray(window.SEARCH_DATA)) {
  const input = searchApp.querySelector('[data-search-input]');
  const typeSelect = searchApp.querySelector('[data-search-type]');
  const regionSelect = searchApp.querySelector('[data-search-region]');
  const count = searchApp.querySelector('[data-search-count]');
  const results = searchApp.querySelector('[data-search-results]');
  const params = new URLSearchParams(window.location.search);

  if (input) input.value = params.get('q') || '';

  function cardTemplate(movie) {
    return `
      <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-meta="${escapeHtml(movie.meta)}">
        <a class="poster-frame" href="${movie.url}">
          <img class="poster-img" src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy" decoding="async" onerror="this.classList.add('is-hidden')">
          <span class="play-chip">播放</span>
        </a>
        <div class="movie-card-body">
          <div class="card-meta">
            <span>${escapeHtml(movie.year)}</span>
            <span>${escapeHtml(movie.type)}</span>
          </div>
          <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
          <p>${escapeHtml(movie.oneLine)}</p>
          <div class="tag-row">
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.genre)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char]));
  }

  function renderSearch() {
    const keyword = (input?.value || '').trim().toLowerCase();
    const typeValue = typeSelect?.value || '';
    const regionValue = regionSelect?.value || '';

    const matched = window.SEARCH_DATA.filter((movie) => {
      const matchKeyword = keyword === '' || movie.searchText.toLowerCase().includes(keyword);
      const matchType = typeValue === '' || movie.type.includes(typeValue);
      const matchRegion = regionValue === '' || movie.region.includes(regionValue);
      return matchKeyword && matchType && matchRegion;
    }).slice(0, 240);

    if (count) count.textContent = `找到 ${matched.length} 条相关影片`;
    if (results) results.innerHTML = matched.map(cardTemplate).join('');
  }

  [input, typeSelect, regionSelect].forEach((control) => {
    if (control) control.addEventListener('input', renderSearch);
    if (control) control.addEventListener('change', renderSearch);
  });

  renderSearch();
}
