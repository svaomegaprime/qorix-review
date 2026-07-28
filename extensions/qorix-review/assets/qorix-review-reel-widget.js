(function () {
  window.initReviewReel = function () {
    let container = document.querySelector(".qorix-review-reel-real-review-section .mySwiper");
    if (!container) return;

    if (container.swiper) {
      container.swiper.destroy(true, true);
    }

    let wrapper = container.closest(".qorix-review-reel-real-review-section");
    let controlsWrapper = wrapper ? wrapper.querySelector(".qorix-review-reel-controls") : null;
    let slides = container.querySelectorAll(".swiper-slide");
    let totalSlides = slides.length;

    let computedStyle = getComputedStyle(wrapper || container);
    let navCols =
      parseInt(computedStyle.getPropertyValue("--nav-cols").trim()) || 3;
    let gapBetweenCards =
      parseInt(computedStyle.getPropertyValue("--gap-between-cards").trim()) ||
      24;
    let autoplayEnabled =
      computedStyle.getPropertyValue("--autoplay-enabled").trim() === "true";
    let autoplaySpeed =
      parseInt(computedStyle.getPropertyValue("--autoplay-speed").trim()) ||
      4000;

    function getActiveSlidesPerView() {
      let width = window.innerWidth;
      if (width < 600) return 1;
      if (width < 1024) return Math.min(2, navCols);
      if (width < 1440) return Math.min(3, navCols);
      return navCols;
    }

    let initialPerView = getActiveSlidesPerView();
    let shouldLoop = totalSlides > initialPerView;

    let swiperOptions = {
      slidesPerView: 1,
      spaceBetween: gapBetweenCards,
      observer: true,
      observeParents: true,
      watchOverflow: true,
      loop: shouldLoop,
      navigation: {
        nextEl: wrapper ? wrapper.querySelector(".qorix-review-reel-swiper-button-next") : ".qorix-review-reel-swiper-button-next",
        prevEl: wrapper ? wrapper.querySelector(".qorix-review-reel-swiper-button-prev") : ".qorix-review-reel-swiper-button-prev",
      },
      pagination: {
        el: wrapper ? wrapper.querySelector(".qorix-review-reel-swiper-pagination") : ".qorix-review-reel-swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        600: { slidesPerView: Math.min(2, navCols), spaceBetween: gapBetweenCards },
        1024: { slidesPerView: Math.min(3, navCols), spaceBetween: gapBetweenCards },
        1440: { slidesPerView: navCols, spaceBetween: gapBetweenCards },
      },
    };

    if (autoplayEnabled && shouldLoop) {
      swiperOptions.autoplay = {
        delay: autoplaySpeed,
        disableOnInteraction: false,
      };
    }

    let swiper = new Swiper(container, swiperOptions);

    function updateControlsVisibility() {
      totalSlides = container.querySelectorAll(".swiper-slide").length;
      let perView = getActiveSlidesPerView();
      let hasOverflow = totalSlides > perView;

      if (controlsWrapper) {
        controlsWrapper.style.display = hasOverflow ? "" : "none";
      }

      if (!hasOverflow && swiper.autoplay && swiper.autoplay.running) {
        swiper.autoplay.stop();
      } else if (hasOverflow && autoplayEnabled && swiper.autoplay && !swiper.autoplay.running) {
        swiper.autoplay.start();
      }
    }

    updateControlsVisibility();
    swiper.on("observerUpdate", updateControlsVisibility);
    swiper.on("breakpoint", updateControlsVisibility);
    swiper.on("resize", updateControlsVisibility);
    window.addEventListener("resize", updateControlsVisibility);

    let currentVideo = null;

    swiper.on("slideChange", function () {
      if (currentVideo) {
        currentVideo.pause();
        currentVideo = null;
      }
      if (autoplayEnabled && swiper.autoplay && swiper.autoplay.running) {
        swiper.autoplay.start();
      }
    });

    // Event delegation for video playback
    container.addEventListener("click", function (e) {
      let btn = e.target.closest(".qorix-review-reel-play-btn");
      if (!btn) return;

      let videoWrapper = btn.closest('.qorix-review-reel-review-card-image[data-media-type="video"]');
      if (!videoWrapper) return;

      let videoSrc = videoWrapper.dataset.videoSrc;

      if (currentVideo) {
        currentVideo.pause();
        currentVideo = null;
      }

      let video = document.createElement("video");
      video.src = videoSrc;
      video.controls = true;
      video.autoplay = true;
      video.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;border-radius:12px;";
      videoWrapper.appendChild(video);
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
        video.remove();
        btn.style.display = "";
        if (autoplayEnabled && swiper.autoplay) {
          swiper.autoplay.start();
        }
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.initReviewReel);
  } else {
    window.initReviewReel();
  }
})();
