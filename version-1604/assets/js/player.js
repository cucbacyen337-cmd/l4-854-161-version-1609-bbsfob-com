import { H as Hls } from "./hls-dru42stk.js";

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var player = document.querySelector("[data-hls-player]");
  var startButton = document.querySelector("[data-video-src]");

  if (!player || !startButton) {
    return;
  }

  var source = startButton.dataset.videoSrc;
  var hlsInstance = null;

  function hideButton() {
    startButton.classList.add("hidden");
  }

  function playNative() {
    player.src = source;
    player.play().catch(function () {
      startButton.classList.remove("hidden");
    });
  }

  function playWithHls() {
    if (hlsInstance) {
      player.play().catch(function () {
        startButton.classList.remove("hidden");
      });
      return;
    }

    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(player);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      player.play().catch(function () {
        startButton.classList.remove("hidden");
      });
    });

    hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
      if (data && data.fatal) {
        startButton.classList.remove("hidden");
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  startButton.addEventListener("click", function () {
    if (!source) {
      return;
    }

    hideButton();

    if (Hls && Hls.isSupported()) {
      playWithHls();
    } else if (player.canPlayType("application/vnd.apple.mpegurl")) {
      playNative();
    } else {
      startButton.classList.remove("hidden");
      window.alert("当前浏览器暂不支持 HLS 播放，请更换浏览器或使用 Safari/Chrome 访问。 ");
    }
  });

  player.addEventListener("pause", function () {
    if (player.currentTime === 0 || player.ended) {
      startButton.classList.remove("hidden");
    }
  });
});
