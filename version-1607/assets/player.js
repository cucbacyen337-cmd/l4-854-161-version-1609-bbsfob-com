(function () {
  function readPlayback() {
    var node = document.getElementById('playback-data');
    if (!node) {
      return '';
    }
    try {
      var data = JSON.parse(node.textContent || '{}');
      return data.url || '';
    } catch (error) {
      return '';
    }
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player]');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-play-button]');
    var streamUrl = readPlayback();
    var ready = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    if (cover) {
      cover.addEventListener('click', function () {
        play();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
})();
