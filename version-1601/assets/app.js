(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  $$('.menu-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var nav = $('.mobile-nav');
      if (!nav) {
        return;
      }
      var open = nav.hasAttribute('hidden');
      if (open) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
      button.setAttribute('aria-expanded', String(open));
    });
  });

  $$('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = 'search.html?q=' + encodeURIComponent(query);
      } else {
        window.location.href = 'search.html';
      }
    });
  });

  var slides = $$('.hero-slide');
  var dots = $$('.hero-dot');
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (next) {
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var queryInput = $('#search-input');
  if (queryInput && initialQuery) {
    queryInput.value = initialQuery;
  }

  $$('[data-card-filter]').forEach(function (panel) {
    var root = panel.parentElement || document;
    var textInput = $('[data-text-filter]', panel);
    var regionSelect = $('[data-region-filter]', panel);
    var typeSelect = $('[data-type-filter]', panel);
    var yearSelect = $('[data-year-filter]', panel);
    var categorySelect = $('[data-category-filter]', panel);
    var empty = $('[data-empty-result]', root) || $('[data-empty-result]');
    var cards = $$('[data-movie-card]', root);

    function matches(card) {
      var text = normalize(textInput ? textInput.value : '');
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var ok = true;
      if (text) {
        ok = ok && normalize(card.getAttribute('data-search')).indexOf(text) !== -1;
      }
      if (region) {
        ok = ok && card.getAttribute('data-region') === region;
      }
      if (type) {
        ok = ok && card.getAttribute('data-type') === type;
      }
      if (year) {
        ok = ok && card.getAttribute('data-year') === year;
      }
      if (category) {
        ok = ok && card.getAttribute('data-category') === category;
      }
      return ok;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [textInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
