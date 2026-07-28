const sortDropdown = document.querySelector('.qr-sort-dropdown');
const sortBtn = document.querySelector('.qr-sort-btn');
const sortBtnText = document.querySelector('.qr-sort-btn-text');
const sortItems = document.querySelectorAll('.qr-sort-menu li');

const savedSort = sessionStorage.getItem('selectedSort');

if (savedSort) {
  sortItems.forEach((item) => {
    if (item.dataset.sort === savedSort) {
      item.classList.add('active');
      sortBtnText.textContent = `Sort by: ${item.textContent.trim()}`;
    }
  });
}


sortBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sortDropdown.classList.toggle('is-open');
});


document.addEventListener('click', () => {
  sortDropdown.classList.remove('is-open');
});


sortItems.forEach((item) => {
  item.addEventListener('click', () => {


    sortItems.forEach((li) => {
      li.classList.remove('active');
    });


    item.classList.add('active');


    sortBtnText.textContent = `Sort by: ${item.textContent.trim()}`;


    sessionStorage.setItem(
      'selectedSort',
      item.dataset.sort
    );


    sortDropdown.classList.remove('is-open');
  });
});


/* ---------------- Lightbox ---------------- */
const lightbox = document.getElementById('qrLightbox');

if (lightbox) {

  if (lightbox.parentElement !== document.body) {
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector('.qr-lightbox-img');
  const lightboxVideo = lightbox.querySelector('.qr-lightbox-video');
  const lightboxClose = lightbox.querySelector('.qr-lightbox-close');

  const openLightbox = (src, type) => {
    if (type === 'video') {
      lightboxImg.style.display = 'none';
      lightboxVideo.style.display = 'block';
      lightboxVideo.src = src;
      lightboxVideo.play();
    } else {
      lightboxVideo.pause();
      lightboxVideo.style.display = 'none';
      lightboxVideo.removeAttribute('src');
      lightboxImg.style.display = 'block';
      lightboxImg.src = src;
    }
    lightbox.classList.add('is-open');
    document.body.classList.add('qr-lightbox-active');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('qr-lightbox-active');
    lightboxVideo.pause();
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.qr-lightbox-trigger');
    if (trigger) {
      openLightbox(trigger.dataset.src, trigger.dataset.type);
    }
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    const isMediaOrClose = e.target.closest(
      '.qr-lightbox-img, .qr-lightbox-video, .qr-lightbox-close'
    );
    if (!isMediaOrClose) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

