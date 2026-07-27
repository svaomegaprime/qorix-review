(function () {
  function initReviewReel() {
    let container = document.querySelector(".mySwiper");
    if (!container) return;

    let wrapper = container.closest(".qorix-review-reel-real-review-section");
    let computedStyle = getComputedStyle(wrapper || container);
    let navCols =
      parseInt(computedStyle.getPropertyValue("--nav-cols").trim()) || 3;
    let gapBetweenCards =
      parseInt(computedStyle.getPropertyValue("--gap-between-cards").trim()) ||
      8;
    let autoplayEnabled =
      computedStyle.getPropertyValue("--autoplay-enabled").trim() === "true";
    let autoplaySpeed =
      parseInt(computedStyle.getPropertyValue("--autoplay-speed").trim()) ||
      4000;

    let swiperOptions = {
      slidesPerView: 1,
      spaceBetween: gapBetweenCards,
      observer: true,
      observeParents: true,
      loop: true,
      navigation: {
        nextEl: document.querySelector(".qorix-review-reel-swiper-button-next"),
        prevEl: document.querySelector(".qorix-review-reel-swiper-button-prev"),
      },
      pagination: {
        el: ".qorix-review-reel-swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        600: { slidesPerView: Math.min(2, navCols), spaceBetween: gapBetweenCards },
        1024: { slidesPerView: navCols, spaceBetween: gapBetweenCards },
      },
    };

    if (autoplayEnabled) {
      swiperOptions.autoplay = {
        delay: autoplaySpeed,
        disableOnInteraction: false,
      };
    }

    let swiper = new Swiper(".mySwiper", swiperOptions);
    let currentVideo = null;

    swiper.on("slideChange", function () {
      if (currentVideo) {
        currentVideo.pause();
        currentVideo = null;
      }
      if (autoplayEnabled && swiper.autoplay) {
        swiper.autoplay.start();
      }
    });

    document
      .querySelectorAll(
        '.qorix-review-reel-review-card-image[data-media-type="video"]',
      )
      .forEach(function (wrapper) {
        let btn = wrapper.querySelector(".qorix-review-reel-play-btn");
        let videoSrc = wrapper.dataset.videoSrc;

        btn.addEventListener("click", function () {
          if (currentVideo) {
            currentVideo.pause();
            currentVideo = null;
          }

          let video = document.createElement("video");
          video.src = videoSrc;
          video.controls = true;
          video.autoplay = true;
          video.style.cssText =
            "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;border-radius:8px;";
          wrapper.appendChild(video);
          btn.style.display = "none";

          video.addEventListener("play", function () {
            currentVideo = video;
            if (swiper.autoplay) {
              swiper.autoplay.stop();
            }
          });

          video.addEventListener("pause", function () {
            if (currentVideo === video) {
              currentVideo = null;
            }
            if (autoplayEnabled && swiper.autoplay) {
              swiper.autoplay.start();
            }
          });

          video.addEventListener("ended", function () {
            if (currentVideo === video) {
              currentVideo = null;
            }
            muteBtn.remove();
            if (autoplayEnabled && swiper.autoplay) {
              swiper.autoplay.start();
            }
          });
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReviewReel);
  } else {
    initReviewReel();
  }
})();
