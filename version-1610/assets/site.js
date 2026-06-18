const Site = (() => {
    const openMobileMenu = () => {
        const button = document.querySelector('.mobile-menu-button');
        const nav = document.querySelector('.main-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', () => {
            nav.classList.toggle('is-open');
        });
    };

    const startHero = () => {
        const root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        let current = 0;
        const setSlide = (index) => {
            current = index;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const index = Number(dot.getAttribute('data-hero-dot'));
                if (!Number.isNaN(index)) {
                    setSlide(index);
                }
            });
        });
        window.setInterval(() => {
            setSlide((current + 1) % slides.length);
        }, 5200);
    };

    const fillSelect = (select, values) => {
        if (!select) {
            return;
        }
        values.forEach((value) => {
            if (!value) {
                return;
            }
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    };

    const setupFilters = () => {
        const cards = Array.from(document.querySelectorAll('[data-card]'));
        if (!cards.length) {
            return;
        }
        const input = document.querySelector('[data-search-input]');
        const yearSelect = document.querySelector('[data-year-filter]');
        const regionSelect = document.querySelector('[data-region-filter]');
        const years = Array.from(new Set(cards.map((card) => card.dataset.year).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
        const regions = Array.from(new Set(cards.map((card) => card.dataset.region).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
        fillSelect(yearSelect, years);
        fillSelect(regionSelect, regions);
        const apply = () => {
            const keyword = (input?.value || '').trim().toLowerCase();
            const year = yearSelect?.value || '';
            const region = regionSelect?.value || '';
            cards.forEach((card) => {
                const text = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.genre, card.dataset.tags]
                    .join(' ')
                    .toLowerCase();
                const matchedKeyword = !keyword || text.includes(keyword);
                const matchedYear = !year || card.dataset.year === year;
                const matchedRegion = !region || card.dataset.region === region;
                card.classList.toggle('is-filter-hidden', !(matchedKeyword && matchedYear && matchedRegion));
            });
        };
        [input, yearSelect, regionSelect].forEach((element) => {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });
    };

    const initPlayers = () => {
        const shells = Array.from(document.querySelectorAll('[data-player]'));
        shells.forEach((shell) => {
            const video = shell.querySelector('video');
            const button = shell.querySelector('[data-play-button]');
            const stream = shell.getAttribute('data-stream');
            let prepared = false;
            const prepare = () => {
                if (!video || !stream || prepared) {
                    return;
                }
                prepared = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            };
            const play = () => {
                prepare();
                if (button) {
                    button.classList.add('is-hidden');
                }
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            };
            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', () => {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener('play', () => {
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                });
            }
        });
    };

    const boot = () => {
        openMobileMenu();
        startHero();
        setupFilters();
        initPlayers();
    };

    return { boot };
})();

document.addEventListener('DOMContentLoaded', Site.boot);
