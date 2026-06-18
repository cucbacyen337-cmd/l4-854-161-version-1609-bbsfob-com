(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var menuToggle = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuToggle && mobilePanel) {
      menuToggle.addEventListener("click", function () {
        var expanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!expanded));
        menuToggle.textContent = expanded ? "☰" : "×";
        mobilePanel.hidden = expanded;
      });
    }

    document.querySelectorAll(".cover-frame img, .hero-slide img").forEach(function (image) {
      image.addEventListener("error", function () {
        var frame = image.closest(".cover-frame");
        if (frame) {
          frame.classList.add("is-missing");
        }
      });
    });

    setupHeroSlider();
    setupListingFilters();
    setupSearchPageQuery();
  });

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".slider-dot"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearchPageQuery() {
    var searchInput = document.querySelector("[data-listing-search]");
    if (!searchInput) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      searchInput.value = query;
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function setupListingFilters() {
    var toolbar = document.querySelector("[data-listing-toolbar]");
    var grid = document.querySelector("[data-movie-grid]");
    if (!toolbar || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var searchInput = toolbar.querySelector("[data-listing-search]");
    var regionSelect = toolbar.querySelector('[data-filter="region"]');
    var typeSelect = toolbar.querySelector('[data-filter="type"]');
    var sortSelect = toolbar.querySelector("[data-sort-select]");
    var count = toolbar.querySelector("[data-visible-count]");
    var noResults = document.querySelector("[data-no-results]");

    fillOptions(regionSelect, cards, "region");
    fillOptions(typeSelect, cards, "type");

    function apply() {
      var query = normalize(searchInput && searchInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
          card.dataset.tags
        ].join(" "));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesRegion = !region || normalize(card.dataset.region) === region;
        var matchesType = !type || normalize(card.dataset.type) === type;
        var shouldShow = matchesQuery && matchesRegion && matchesType;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
      if (noResults) {
        noResults.classList.toggle("visible", visible === 0);
      }
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : "default";
      var sorted = cards.slice();
      if (mode === "score") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        });
      } else if (mode === "year") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      } else if (mode === "title") {
        sorted.sort(function (a, b) {
          return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    [searchInput, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", sortCards);
    }

    apply();
  }

  function fillOptions(select, cards, key) {
    if (!select) {
      return;
    }
    var values = [];
    cards.forEach(function (card) {
      var value = card.dataset[key];
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort(function (a, b) {
      return a.localeCompare(b, "zh-Hans-CN");
    });
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }
})();
