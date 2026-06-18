(function () {
    var mobileToggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var forms = document.querySelectorAll('.site-search-form');
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                return;
            }
            event.preventDefault();
            window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startHero() {
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    if (slides.length) {
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-target')) || 0);
                startHero();
            });
        });
        startHero();
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
        var textInput = filterRoot.querySelector('.page-filter');
        var yearSelect = filterRoot.querySelector('.year-filter');
        var chips = Array.prototype.slice.call(filterRoot.querySelectorAll('.filter-chip'));
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card, .ranking-item'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var chipValue = '';

        if (textInput && query) {
            textInput.value = query;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function filterCards() {
            var term = normalize(textInput ? textInput.value : '');
            var year = yearSelect ? yearSelect.value : '';
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ');
                var haystack = normalize(text);
                var matchedText = !term || haystack.indexOf(term) !== -1;
                var matchedYear = !year || card.getAttribute('data-year') === year;
                var matchedChip = !chipValue || haystack.indexOf(normalize(chipValue)) !== -1;
                card.classList.toggle('hidden', !(matchedText && matchedYear && matchedChip));
            });
        }

        if (textInput) {
            textInput.addEventListener('input', filterCards);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                chipValue = chip.getAttribute('data-filter-value') || '';
                filterCards();
            });
        });
        filterCards();
    }
})();
