(function () {
  var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));

  if (!forms.length || !window.SITE_MOVIES) {
    return;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createCard(item) {
    var title = escapeHtml(item.title);
    var line = escapeHtml(item.year + " · " + item.region + " · " + item.type);
    var summary = escapeHtml(item.summary);
    var poster = escapeHtml(item.poster);
    var link = escapeHtml(item.link);

    return [
      '<a class="search-result-card" href="' + link + '">',
      '  <img src="' + poster + '" alt="' + title + '">',
      '  <span>',
      '    <strong>' + title + '</strong>',
      '    <span>' + line + '</span>',
      '    <span>' + summary + '</span>',
      '  </span>',
      '</a>'
    ].join("");
  }

  forms.forEach(function (form) {
    var panel = form.closest(".search-panel");
    var input = form.querySelector("[data-search-input]");
    var filter = form.querySelector("[data-search-filter]");
    var results = panel ? panel.querySelector("[data-search-results]") : null;

    if (!input || !results) {
      return;
    }

    function render() {
      var query = normalize(input.value);
      var type = filter ? normalize(filter.value) : "";

      if (!query && !type) {
        results.innerHTML = "";
        return;
      }

      var matched = window.SITE_MOVIES.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.tags,
          item.summary
        ].join(" "));
        var typeMatch = !type || normalize(item.type).indexOf(type) !== -1 || normalize(item.genre).indexOf(type) !== -1;
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        return typeMatch && queryMatch;
      }).slice(0, 12);

      results.innerHTML = matched.map(createCard).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });

    input.addEventListener("input", render);

    if (filter) {
      filter.addEventListener("change", render);
    }
  });
})();
