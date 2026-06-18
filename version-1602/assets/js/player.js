(function () {
    function attachPlayer(container) {
        var video = container.querySelector('video');
        var button = container.querySelector('.play-overlay');
        var status = container.querySelector('.player-status');
        var stream = video ? video.getAttribute('data-stream') : '';
        var hlsInstance = null;

        function setStatus(text) {
            if (status) {
                status.textContent = text || '';
            }
        }

        function prepare() {
            if (!video || !stream) {
                return Promise.reject(new Error('empty'));
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', stream);
                }
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                }
                return Promise.resolve();
            }
            return Promise.reject(new Error('unsupported'));
        }

        function play() {
            setStatus('');
            prepare().then(function () {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        setStatus('点击视频继续播放');
                    });
                }
            }).catch(function () {
                setStatus('暂时无法播放');
            });
        }

        if (button) {
            button.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('play', function () {
                container.classList.add('is-playing');
                setStatus('');
            });
            video.addEventListener('pause', function () {
                container.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                container.classList.remove('is-playing');
            });
            video.addEventListener('error', function () {
                setStatus('暂时无法播放');
            });
        }
    }

    document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();
