
document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.quickreview-card');

  cards.forEach(function (card) {
    const productId = card.dataset.productId;

    if (productId) {
      fetchQuickReviewData(productId)
        .then(function (data) {
          renderSummary(card, data);
          renderBar(card, data);
          renderMedia(card, data);
          initSwiper(card);
        })
        .catch(function () {
          
          initSwiper(card);
        });
    } else {
      
      initSwiper(card);
    }
  });

  // ---------- Fetch (replace URL with your actual backend/app-proxy endpoint) ----------
  function fetchQuickReviewData(productId) {
    return fetch('/apps/quickreview/summary?product_id=' + productId)
      .then(function (res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      });
  }

  // ---------- Rating Summary ----------
  function renderSummary(card, data) {
    if (!data) return;
    const scoreEl = card.querySelector('[data-quickreview-average]');
    const countEl = card.querySelector('[data-quickreview-count]');
    const starEls = card.querySelectorAll('[data-star-index]');

    if (scoreEl && data.average != null) scoreEl.textContent = data.average.toFixed(1);
    if (countEl && data.count != null) countEl.textContent = '(' + data.count + ' reviews)';

    if (data.average != null) {
      starEls.forEach(function (star) {
        const index = parseInt(star.dataset.starIndex, 10);
        star.classList.toggle('is-filled', index <= Math.round(data.average));
      });
    }
  }

  // ---------- Rating Bar ----------
  function renderBar(card, data) {
    const barWrapper = card.querySelector('[data-quickreview-bar]');
    if (!barWrapper || !data || !data.breakdown) return;

    const total = Object.values(data.breakdown).reduce(function (a, b) { return a + b; }, 0);

    Object.keys(data.breakdown).forEach(function (level) {
      const count = data.breakdown[level];
      const percent = total > 0 ? (count / total) * 100 : 0;

      const fillEl = barWrapper.querySelector('[data-quickreview-bar-fill="' + level + '"]');
      const countEl = barWrapper.querySelector('[data-quickreview-bar-count="' + level + '"]');

      if (fillEl) fillEl.style.width = percent + '%';
      if (countEl) countEl.textContent = count;
    });
  }

  // ---------- Media Slides (inject dynamic images before Swiper init) ----------
  function renderMedia(card, data) {
    const mediaWrapper = card.querySelector('[data-quickreview-swiper-wrapper]');
    if (!mediaWrapper || !data || !data.media || !data.media.length) return;

    mediaWrapper.innerHTML = data.media.map(function (item) {
      return '<div class="swiper-slide quickreview-media__slide">' +
               '<img class="quickreview-media__img" src="' + item.image_url + '" alt="Review media" loading="lazy">' +
             '</div>';
    }).join('');
  }

  // ---------- Media Slider (uses existing swiper-bundle.min.js) ----------
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


/**---------------------------Reviews Js--------------------------- */

document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll('.quickreview-reviews');

  sections.forEach(function (section) {
    initSortDropdown(section);
    initFiltersToggle(section);
    initRatingPills(section);
    initLoadMore(section);

    const productId = section.dataset.productId;
    if (productId) {
      fetchReviews(productId)
        .then(function (data) {
          renderReviews(section, data);
        })
        .catch(function () {
          // keep static/demo markup on failure
        });
    }
  });

  // ---------- Sort dropdown ----------
  function initSortDropdown(section) {
    const toggle = section.querySelector('[data-quickreview-sort-toggle]');
    const menu = section.querySelector('[data-quickreview-sort-menu]');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = !menu.hidden;
      menu.hidden = isOpen;
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    menu.querySelectorAll('li').forEach(function (item) {
      item.addEventListener('click', function () {
        menu.querySelectorAll('li').forEach(function (li) { li.classList.remove('is-active'); });
        item.classList.add('is-active');
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');

        // Re-fetch with the chosen sort value
        const productId = section.dataset.productId;
        if (productId) {
          fetchReviews(productId, { sort: item.dataset.sortValue })
            .then(function (data) { renderReviews(section, data); });
        }
      });
    });

    document.addEventListener('click', function () {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  // ---------- Filters row toggle ----------
  function initFiltersToggle(section) {
    const toggle = section.querySelector('[data-quickreview-filters-toggle]');
    const filters = section.querySelector('[data-quickreview-filters]');
    if (!toggle || !filters) return;

    toggle.addEventListener('click', function () {
      const isHidden = filters.hasAttribute('hidden');
      if (isHidden) {
        filters.removeAttribute('hidden');
      } else {
        filters.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(isHidden));
    });
  }

  // ---------- Rating pills ----------
  function initRatingPills(section) {
    const pills = section.querySelectorAll('[data-quickreview-rating-pills] .quickreview-pill');
    if (!pills.length) return;

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');

        const rating = pill.dataset.rating;
        const productId = section.dataset.productId;
        if (productId) {
          fetchReviews(productId, { rating: rating }).then(function (data) {
            renderReviews(section, data);
          });
        }
      });
    });
  }

  // ---------- Load more ----------
  function initLoadMore(section) {
    const btn = section.querySelector('[data-quickreview-load-more]');
    if (!btn) return;

    let page = 1;
    btn.addEventListener('click', function () {
      page += 1;
      const productId = section.dataset.productId;
      if (productId) {
        fetchReviews(productId, { page: page }).then(function (data) {
          appendReviews(section, data);
        });
      }
    });
  }

  // ---------- Fetch (replace URL with your actual backend/app-proxy endpoint) ----------
  function fetchReviews(productId, params) {
    const query = new URLSearchParams(Object.assign({ product_id: productId }, params || {}));
    return fetch('/apps/quickreview/reviews?' + query.toString())
      .then(function (res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      });
  }

  // ---------- Render (replaces the list) ----------
  function renderReviews(section, data) {
    const list = section.querySelector('[data-quickreview-reviews-list]');
    if (!list || !data || !data.reviews) return;
    list.innerHTML = data.reviews.map(buildReviewHtml).join('');
  }

  // ---------- Append (for "load more") ----------
  function appendReviews(section, data) {
    const list = section.querySelector('[data-quickreview-reviews-list]');
    if (!list || !data || !data.reviews) return;
    list.insertAdjacentHTML('beforeend', data.reviews.map(buildReviewHtml).join(''));
  }

  // ---------- Build one review card's HTML from a review object ----------
  // Expected shape: { author, date, rating, product_title, body, media: [{image_url}], helpful_count }
  function buildReviewHtml(review) {
    const stars = [1, 2, 3, 4, 5].map(function (i) {
      const filled = i <= Math.round(review.rating || 0) ? ' is-filled' : '';
      return '<svg class="quickreview-review__star' + filled + '" width="16" height="16" viewBox="0 0 24 24">' +
        '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>';
    }).join('');

    const media = (review.media || []).slice(0, 3).map(function (item) {
      return '<div class="quickreview-review__media-item">' +
        '<img class="quickreview-review__media-img" src="' + item.image_url + '" alt="Review media" loading="lazy"></div>';
    }).join('');

    return (
      '<div class="quickreview-review" data-quickreview-review data-rating="' + (review.rating || '') + '">' +
        '<div class="quickreview-review__head">' +
          '<div class="quickreview-review__avatar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none">' +
            '<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6"/>' +
            '<path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div>' +
          '<div class="quickreview-review__meta">' +
            '<span class="quickreview-review__author">' + (review.author || '') + '</span>' +
            '<span class="quickreview-review__date">' + (review.date || '') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="quickreview-review__stars">' + stars + '</div>' +
        '<h3 class="quickreview-review__product">' + (review.product_title || '') + '</h3>' +
        '<p class="quickreview-review__body">' + (review.body || '') + '</p>' +
        (media ? '<div class="quickreview-review__media">' + media + '</div>' : '') +
        '<div class="quickreview-review__footer">' +
          '<button type="button" class="quickreview-review__helpful">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none">' +
              '<path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zm0 0l4.5-8a2 2 0 0 1 3.5 1.6L14 9h5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H10a3 3 0 0 1-3-3v-6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>' +
            'Helpful (<span>' + (review.helpful_count || 0) + '</span>)' +
          '</button>' +
          '<button type="button" class="quickreview-review__report">Report</button>' +
        '</div>' +
      '</div>'
    );
  }
});