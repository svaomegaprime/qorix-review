document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.qr-quote-swiper').forEach((slider) => {

    const desktopSlides = parseInt(slider.dataset.desktopSlides, 10) || 5;

    new Swiper(slider, {
      speed: 600,
      loop: true,
      slidesPerGroup: 1,
      allowTouchMove: true,

      observer: true,
      observeParents: true,
      watchSlidesProgress: true,

      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },

      pagination: {
        el: slider.querySelector('.swiper-pagination'),
        clickable: true,
      },

      navigation: {
        nextEl: slider.querySelector('.swiper-button-next'),
        prevEl: slider.querySelector('.swiper-button-prev'),
      },

      breakpoints: {
        320: {
          slidesPerView: 'auto',
          slidesPerGroup: 1,
          spaceBetween: 12,
        },
        768: {
          slidesPerView: 2,
          slidesPerGroup: 1,
          spaceBetween: 20,
          centeredSlides: true,
        },
        1024: {
          slidesPerView: 3,
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

  });
});