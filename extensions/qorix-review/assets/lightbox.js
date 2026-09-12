/* global Swiper */
window.qorixLightboxComponent = function () {
  return {
    swiperInstance: null,
    get attachments() {
      const store = window.Alpine && window.Alpine.store('qorixPopup');
      if (store && store.lightboxAttachments && store.lightboxAttachments.length > 0) {
        return store.lightboxAttachments;
      }
      if (store && store.lightboxMedia) {
        return [store.lightboxMedia];
      }
      return [];
    },
    get hasMultipleAttachments() {
      return this.attachments.length > 1;
    },
    get currentIndex() {
      const store = window.Alpine && window.Alpine.store('qorixPopup');
      return store && typeof store.lightboxActiveIndex === 'number' ? store.lightboxActiveIndex : 0;
    },
    init() {
      this.$watch('$store.qorixPopup.lightboxOpen', (isOpen) => {
        if (isOpen) {
          this.$nextTick(() => {
            this.setupSwiper();
          });
        } else {
          this.destroyOrPause();
        }
      });
    },
    setupSwiper() {
      const runInit = () => {
        const el = this.$refs.swiperContainer;
        if (!el) return;

        const store = window.Alpine && window.Alpine.store('qorixPopup');
        const initIdx = store && typeof store.lightboxActiveIndex === 'number' ? store.lightboxActiveIndex : 0;

        if (this.swiperInstance) {
          this.swiperInstance.update();
          this.swiperInstance.slideTo(initIdx, 0);
          return;
        }

        if (typeof Swiper === 'undefined' && typeof window.Swiper === 'undefined') {
          setTimeout(runInit, 60);
          return;
        }

        const SwiperClass = typeof Swiper !== 'undefined' ? Swiper : window.Swiper;
        const container = el.parentElement;

        this.swiperInstance = new SwiperClass(el, {
          slidesPerView: 1,
          spaceBetween: 24,
          initialSlide: initIdx,
          watchOverflow: true,
          observer: true,
          observeParents: true,
          observeSlideChildren: true,
          navigation: {
            prevEl: container
              ? container.querySelector('.qr-lightbox-swiper-button-prev')
              : '.qr-lightbox-swiper-button-prev',
            nextEl: container
              ? container.querySelector('.qr-lightbox-swiper-button-next')
              : '.qr-lightbox-swiper-button-next',
          },
          keyboard: {
            enabled: true,
            onlyInViewport: false,
          },
          on: {
            slideChange: () => {
              const sw = this.swiperInstance;
              if (!sw) return;
              const activeIdx = sw.activeIndex;
              const store = window.Alpine && window.Alpine.store('qorixPopup');
              if (store) {
                store.lightboxActiveIndex = activeIdx;
                if (this.attachments[activeIdx]) {
                  store.lightboxMedia = this.attachments[activeIdx];
                }
              }
              const slides = el.querySelectorAll('.swiper-slide');
              slides.forEach((slide, idx) => {
                if (idx !== activeIdx) {
                  const video = slide.querySelector('video');
                  if (video && !video.paused) video.pause();
                }
              });
            },
          },
        });
      };

      setTimeout(runInit, 60);
    },
    destroyOrPause() {
      const el = this.$refs.swiperContainer;
      if (el) {
        const videos = el.querySelectorAll('video');
        videos.forEach((vid) => {
          if (!vid.paused) vid.pause();
        });
      }
      if (this.swiperInstance) {
        try {
          this.swiperInstance.destroy(true, true);
        } catch (_err) {
          // ignore destroy errors
        }
        this.swiperInstance = null;
      }
    },
    close() {
      this.destroyOrPause();
      if (window.QorixPopup && window.QorixPopup.closeLightbox) {
        window.QorixPopup.closeLightbox();
      }
    },
  };
};
