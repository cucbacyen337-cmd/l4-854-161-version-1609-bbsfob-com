(function () {
  var configEl = document.getElementById('player-config');
  var video = document.getElementById('movie-player');
  var overlay = document.getElementById('player-overlay');
  var button = document.getElementById('player-play');

  if (!configEl || !video || !overlay || !button) {
    return;
  }

  var config = {};
  try {
    config = JSON.parse(configEl.textContent || '{}');
  } catch (error) {
    config = {};
  }

  var source = config.source || '';
  var hls = null;
  var ready = false;

  function attachSource() {
    if (ready || !source) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function playVideo() {
    attachSource();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', playVideo);
  button.addEventListener('click', function (event) {
    event.stopPropagation();
    playVideo();
  });
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
