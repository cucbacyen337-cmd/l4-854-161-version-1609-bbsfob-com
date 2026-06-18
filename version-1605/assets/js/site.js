(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyCardFilter(root) {
    var scope = root || document;
    var searchInput = scope.querySelector('[data-page-search]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var query = normalize(searchInput && searchInput.value);
    var year = yearSelect ? yearSelect.value : '';

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-genre')
      ].join(' '));
      var cardYear = card.getAttribute('data-year') || '';
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedYear = !year || cardYear === year;
      card.hidden = !(matchedQuery && matchedYear);
    });
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-page-search]');
      var select = panel.querySelector('[data-year-filter]');
      var form = panel.querySelector('[data-search-form]');

      if (input) {
        input.addEventListener('input', function () {
          applyCardFilter(document);
        });
      }

      if (select) {
        select.addEventListener('change', function () {
          applyCardFilter(document);
        });
      }

      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          applyCardFilter(document);
        });
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      var pageInput = document.querySelector('[data-page-search]');
      if (pageInput) {
        pageInput.value = query;
        applyCardFilter(document);
      }
    }

    Array.prototype.slice.call(document.querySelectorAll('.site-header [data-search-form]')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var field = form.querySelector('input[name="q"]');
        var value = field ? field.value.trim() : '';
        if (!document.querySelector('[data-page-search]')) {
          return;
        }
        event.preventDefault();
        var target = document.querySelector('[data-page-search]');
        if (target) {
          target.value = value;
          applyCardFilter(document);
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero-slider]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
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
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

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

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-player][data-src]'));
    buttons.forEach(function (button) {
      var hasStarted = false;
      button.addEventListener('click', function () {
        var selector = button.getAttribute('data-player');
        var source = button.getAttribute('data-src');
        var video = selector ? document.querySelector(selector) : null;
        if (!video || !source) {
          return;
        }

        button.classList.add('is-hidden');

        if (!hasStarted) {
          hasStarted = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            var player = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            player.loadSource(source);
            player.attachMedia(video);
            video._streamPlayer = player;
          } else {
            video.src = source;
          }
        }

        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initFilters();
    initHero();
    initPlayers();
  });
})();
