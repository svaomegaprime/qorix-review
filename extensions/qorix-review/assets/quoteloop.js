/* global Swiper */

function initQuoteLoopSwiper() {
  if (typeof Swiper === 'undefined' && typeof window.Swiper === 'undefined') return;
  const SwiperClass = typeof Swiper !== 'undefined' ? Swiper : window.Swiper;

  document.querySelectorAll('.qr-quote-swiper').forEach((slider) => {
    const desktopSlides = parseInt(slider.dataset.desktopSlides, 10) || 3;
    const isAutoplay = slider.dataset.quoteLoopAutoplay === 'true' || slider.dataset.quoteLoopAutoplay === '1';
    const speed = parseInt(slider.dataset.quoteLoopSpeed, 10) || 450;

    const slidesCount = slider.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide').length;
    if (slidesCount === 0) return;

    if (slider.swiper) {
      if (slider.swiper.qorixSlidesCount === slidesCount) {
        slider.swiper.update();
        return;
      }
      slider.swiper.destroy(true, true);
    }

    const shouldLoop = slidesCount > desktopSlides;

    const swiper = new SwiperClass(slider, {
      speed: speed,
      loop: shouldLoop,
      slidesPerGroup: 1,
      allowTouchMove: true,

      observer: true,
      observeParents: true,
      resizeObserver: true,
      updateOnWindowResize: true,
      watchSlidesProgress: true,

      autoplay: isAutoplay ? {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      } : false,

      pagination: {
        el: slider.querySelector('.swiper-pagination'),
        clickable: true,
        dynamicBullets: true,
        dynamicMainBullets: 3,
      },

      navigation: {
        nextEl: slider.querySelector('.swiper-button-next'),
        prevEl: slider.querySelector('.swiper-button-prev'),
      },

      breakpoints: {
        320: {
          slidesPerView: 1.2,
          slidesPerGroup: 1,
          spaceBetween: 12,
          centeredSlides: true,
        },
        640: {
          slidesPerView: Math.min(desktopSlides, 2),
          slidesPerGroup: 1,
          spaceBetween: 16,
          centeredSlides: true,
        },
        900: {
          slidesPerView: desktopSlides,
          slidesPerGroup: 1,
          spaceBetween: 20,
          centeredSlides: true,
        },
        1200: {
          slidesPerView: desktopSlides,
          slidesPerGroup: 1,
          spaceBetween: 24,
          centeredSlides: true,
        }
      },
    });

    function adjustDynamicPaginationWidth(pEl) {
      if (pEl && pEl.classList.contains('swiper-pagination-bullets-dynamic')) {
        const w = parseFloat(pEl.style.width);
        if (w) {
          pEl.style.width = `${w + 18}px`;
        }
      }
    }

    swiper.on('paginationUpdate', (sw, pEl) => {
      adjustDynamicPaginationWidth(pEl);
    });

    if (shouldLoop && typeof swiper.loopFix === 'function') {
      swiper.loopFix();
    }
    swiper.update();
    adjustDynamicPaginationWidth(slider.querySelector('.swiper-pagination'));

    swiper.qorixSlidesCount = slidesCount;
  });
}

window.initQuoteLoopSwiper = initQuoteLoopSwiper;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQuoteLoopSwiper);
} else {
  initQuoteLoopSwiper();
}
