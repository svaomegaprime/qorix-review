function initQuickReviewSwiper() {
  if (typeof Swiper === 'undefined') return;

  document.querySelectorAll('.quickreview-card').forEach(function (card) {
    const swiperEl = card.querySelector('[data-quickreview-swiper]');
    if (!swiperEl) return;

    if (swiperEl.swiper) {
      swiperEl.swiper.update();
      return;
    }

    new Swiper(swiperEl, {
      slidesPerView: 'auto',
      spaceBetween: 20,
      watchOverflow: true,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: card.querySelector('[data-quickreview-nav-next]'),
        prevEl: card.querySelector('[data-quickreview-nav-prev]')
      }
    });
  });
}

window.initQuickReviewSwiper = initQuickReviewSwiper;
document.addEventListener('DOMContentLoaded', initQuickReviewSwiper);
