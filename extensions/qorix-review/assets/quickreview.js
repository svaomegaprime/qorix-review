document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.quickreview-card');

  cards.forEach(function (card) {
    const productId = card.dataset.productId;
    initSwiper(card);
  });

  function initSwiper(card) {
    const swiperEl = card.querySelector('[data-quickreview-swiper]');
    if (!swiperEl || typeof Swiper === 'undefined') return;

    // Avoid double-initializing the same slider
    if (swiperEl.swiper) return;

    new Swiper(swiperEl, {
      slidesPerView: 'auto',
      spaceBetween: 36,
      watchOverflow: true, 
      navigation: {
        nextEl: card.querySelector('[data-quickreview-nav-next]'),
        prevEl: card.querySelector('[data-quickreview-nav-prev]')
      }
    });
  }
});
