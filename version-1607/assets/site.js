(function () {
  function getText(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupGlobalSearch() {
    var forms = document.querySelectorAll('[data-global-search]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input');
        var query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = './categories.html?q=' + encodeURIComponent(query);
        } else {
          window.location.href = './categories.html';
        }
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      });
    });

    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-filter-panel') || 'body';
      var scope = document.querySelector(scopeSelector) || document;
      var input = panel.querySelector('[data-search]');
      var region = panel.querySelector('[data-region]');
      var type = panel.querySelector('[data-type]');
      var year = panel.querySelector('[data-year]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var empty = scope.querySelector('[data-filter-empty]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && input) {
        input.value = query;
      }

      function apply() {
        var term = getText(input && input.value);
        var selectedRegion = getText(region && region.value);
        var selectedType = getText(type && type.value);
        var selectedYear = getText(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = getText([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          var ok = true;
          if (term && haystack.indexOf(term) === -1) {
            ok = false;
          }
          if (selectedRegion && getText(card.dataset.region) !== selectedRegion) {
            ok = false;
          }
          if (selectedType && getText(card.dataset.type) !== selectedType) {
            ok = false;
          }
          if (selectedYear && getText(card.dataset.year) !== selectedYear) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, region, type, year].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupGlobalSearch();
    setupHero();
    setupFilters();
  });
})();
