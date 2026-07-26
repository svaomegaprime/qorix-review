(function () {
  function initVideoStack() {
    const section = document.querySelector('[data-section="qorix-review-video-stack-widget"]');
    if (!section) return;

    /* ── Read CSS custom properties (var() declarations) ── */
    const computedStyle = getComputedStyle(section);
    const navCols = parseInt(computedStyle.getPropertyValue('--nav-cols').trim()) || 5;
    const autoplayEnabled = computedStyle.getPropertyValue('--autoplay-enabled').trim() === 'false';
    const autoplaySpeed = parseInt(computedStyle.getPropertyValue('--autoplay-speed').trim()) || 3000;
    const autoplayOnHover = computedStyle.getPropertyValue('--autoplay-on-hover').trim() === 'true';
    const loopVideoSetting = computedStyle.getPropertyValue('--loop-video').trim() === 'true';

    const stackSlides = Array.from(section.querySelectorAll('.qorix-review-video-stack-swiper-slide'));
    const paginationContainer = section.querySelector('.qorix-review-video-stack-custom-pagination');
    const stackPrev = section.querySelector('.qorix-review-video-stack-nav-prev');
    const stackNext = section.querySelector('.qorix-review-video-stack-nav-next');
    const swiperEl = section.querySelector('.qorix-review-video-stack-swiper');

    /* ── Responsive column count ── */
    function getEffectiveCols() {
      if (window.innerWidth <= 1024) return 3;
      return navCols;
    }

    let halfCols = Math.floor(getEffectiveCols() / 2);

    /* ── Compute card widths from container pixel width ── */
    function computeCardWidths() {
      const cols = getEffectiveCols();
      halfCols = Math.floor(cols / 2);

      const containerWidth = swiperEl.offsetWidth;
      const gapVal = parseFloat(getComputedStyle(swiperEl).getPropertyValue('--gap')) || 20;
      const half = Math.floor(cols / 2);
      const isMobileFocus = window.innerWidth <= 610;

      // On ≤610px: center is bigger (1.6x), adjacent smaller (0.7x)
      // On larger: center 1.22x, adjacent 1x, outer 0.64x
      const weights = [];
      for (let i = 0; i < cols; i++) {
        const dist = Math.abs(i - half);
        if (isMobileFocus) {
          if (dist === 0) weights.push(1.6);
          else weights.push(0.7);
        } else {
          if (dist === 0) weights.push(1.22);
          else if (dist === 1) weights.push(1);
          else weights.push(0.64);
        }
      }
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const totalGaps = (cols - 1) * gapVal;
      const unitWidth = (containerWidth - totalGaps) / totalWeight;

      const centerWeight = isMobileFocus ? 1.6 : 1.22;
      const adjacentWeight = isMobileFocus ? 0.7 : 1;
      const outerWeight = isMobileFocus ? 0.7 : 0.64;

      const centerW = Math.round(unitWidth * centerWeight);
      const adjacentW = Math.round(unitWidth * adjacentWeight);
      const outerW = Math.round(unitWidth * outerWeight);

      swiperEl.style.setProperty('--card-w-center', centerW + 'px');
      swiperEl.style.setProperty('--card-w-adjacent', adjacentW + 'px');
      swiperEl.style.setProperty('--card-w-outer', outerW + 'px');
    }

    computeCardWidths();
    window.addEventListener('resize', () => {
      computeCardWidths();
      renderStack();
    });

    let activeVideoIndex = Math.min(halfCols, stackSlides.length - 1);
    let stackDots = [];
    let autoplayTimer = null;
    let currentVideo = null; // tracks the currently playing <video>
    let dragMoved = false;

    /* ── Time formatting helper ── */
    function formatTime(seconds) {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
      return m + ':' + s;
    }

    /* ── Countdown timer ── */
    function startCountdown(video) {
      const card = video.closest('.qorix-review-video-stack-card');
      if (!card) return;
      const pillSpan = card.querySelector('.qorix-review-video-stack-pill span');
      if (!pillSpan) return;

      if (!video.dataset.totalDuration) {
        video.dataset.totalDuration = video.duration;
      }

      function onTimeUpdate() {
        const remaining = Math.max(0, video.duration - video.currentTime);
        pillSpan.textContent = formatTime(remaining);
      }

      if (video._timeUpdateHandler) {
        video.removeEventListener('timeupdate', video._timeUpdateHandler);
      }
      video._timeUpdateHandler = onTimeUpdate;
      video.addEventListener('timeupdate', onTimeUpdate);
    }

    function stopCountdown(video, restoreTotal) {
      if (video._timeUpdateHandler) {
        video.removeEventListener('timeupdate', video._timeUpdateHandler);
        video._timeUpdateHandler = null;
      }
      if (restoreTotal && video.dataset.totalDuration) {
        const card = video.closest('.qorix-review-video-stack-card');
        if (card) {
          const pillSpan = card.querySelector('.qorix-review-video-stack-pill span');
          if (pillSpan) {
            pillSpan.textContent = formatTime(parseFloat(video.dataset.totalDuration));
          }
        }
      }
    }

    /* ── SVG icon helpers ── */
    const PLAY_ICON =
      '<svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M1 1L9 6L1 11V1Z" fill="#303030"/></svg>';
    const PAUSE_ICON =
      '<svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect width="3" height="12" fill="#303030"/><rect x="7" width="3" height="12" fill="#303030"/></svg>';

    /* ── Stack layout helpers ── */
    function getStackOffset(index, activeIndex, total) {
      let offset = index - activeIndex;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      return offset;
    }

    function renderStack() {
      const positionClasses = [
        'qorix-review-video-stack-visible-slide',
        'qorix-review-video-stack-tier-center',
        'qorix-review-video-stack-tier-adjacent',
        'qorix-review-video-stack-tier-outer',
        'qorix-review-video-stack-position--2',
        'qorix-review-video-stack-position--1',
        'qorix-review-video-stack-position-0',
        'qorix-review-video-stack-position-1',
        'qorix-review-video-stack-position-2',
      ];

      stackSlides.forEach(function (slide, index) {
        slide.classList.remove.apply(slide.classList, positionClasses);
        slide.style.transform = '';
        slide.style.zIndex = '';

        const offset = getStackOffset(index, activeVideoIndex, stackSlides.length);
        if (Math.abs(offset) > halfCols) return;

        const tier =
          offset === 0
            ? 'qorix-review-video-stack-tier-center'
            : Math.abs(offset) === 1
              ? 'qorix-review-video-stack-tier-adjacent'
              : 'qorix-review-video-stack-tier-outer';

        slide.classList.add('qorix-review-video-stack-visible-slide', tier);

        if (Math.abs(offset) <= 2) {
          slide.classList.add('qorix-review-video-stack-position-' + offset);
        } else {
          const style = getComputedStyle(swiperEl);
          const dOuter = parseFloat(style.getPropertyValue('--d-outer'));
          const cardWOuter = parseFloat(style.getPropertyValue('--card-w-outer'));
          const gap = parseFloat(style.getPropertyValue('--gap'));
          const distance = dOuter + (Math.abs(offset) - 2) * (cardWOuter + gap);
          const sign = offset > 0 ? '' : '-';
          slide.style.transform = 'translate(calc(' + sign + distance + 'px - var(--card-w-center) / 2), -50%)';
          slide.style.zIndex = 1;
        }
      });

      updatePagination(activeVideoIndex);
    }

    function initPagination() {
      paginationContainer.innerHTML = '';
      stackDots = [];
      for (let i = 0; i < stackSlides.length; i++) {
        const dot = document.createElement('button');
        dot.className = 'qorix-review-video-stack-dot';
        dot.type = 'button';
        dot.dataset.index = i;
        dot.setAttribute('aria-label', 'Show video ' + (i + 1));
        dot.addEventListener('click', function () {
          goToVideo(parseInt(dot.dataset.index, 10));
        });
        paginationContainer.appendChild(dot);
        stackDots.push(dot);
      }
    }

    function updatePagination(activeIndex) {
      stackDots.forEach(function (dot) {
        dot.classList.remove('active');
      });
      if (stackDots[activeIndex]) stackDots[activeIndex].classList.add('active');
    }

    /* ── Stop the currently playing video and clean up ── */
    function stopCurrentVideo() {
      if (currentVideo) {
        currentVideo.pause();
        currentVideo.muted = true;
        if (loopVideoSetting) {
          currentVideo.setAttribute('loop', '');
        } else {
          currentVideo.removeAttribute('loop');
        }
        stopCountdown(currentVideo, true);
        /* restore the play button on the card */
        const card = currentVideo.closest('.qorix-review-video-stack-card');
        if (card) {
          const playBtn = card.querySelector('.qorix-review-video-stack-play');
          if (playBtn) {
            playBtn.innerHTML = PLAY_ICON;
            playBtn.style.display = '';
          }
        }
        currentVideo = null;
      }
    }

    /* ── Navigate to slide — stops any playing video ── */
    function goToVideo(index) {
      stopCurrentVideo();
      activeVideoIndex = (index + stackSlides.length) % stackSlides.length;
      renderStack();
      if (autoplayEnabled) {
        restartAutoplay();
      }
    }

    /* ── Autoplay loop control ── */
    function restartAutoplay() {
      window.clearInterval(autoplayTimer);
      autoplayTimer = window.setInterval(function () {
        goToVideo(activeVideoIndex + 1);
      }, autoplaySpeed);
    }

    function stopAutoplay() {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    /* ── Nav arrow clicks ── */
    stackPrev.addEventListener('click', function () {
      goToVideo(activeVideoIndex - 1);
    });
    stackNext.addEventListener('click', function () {
      goToVideo(activeVideoIndex + 1);
    });

    /* ── Play/Pause video logic helper ── */
    function playVideo(video, playBtn) {
      if (currentVideo && currentVideo !== video) {
        stopCurrentVideo();
      }

      if (loopVideoSetting) {
        video.setAttribute('loop', '');
      } else {
        video.removeAttribute('loop');
      }
      video.muted = false; // unmute to play sound if the video has audio track

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(function () {
            currentVideo = video;
            startCountdown(video);
            if (playBtn) {
              playBtn.innerHTML = PAUSE_ICON;
            }
            stopAutoplay();
          })
          .catch(function (error) {
            console.log('Video play failed: ', error);
          });
      }
    }

    function pauseVideo(video, playBtn) {
      if (currentVideo === video) {
        video.pause();
        stopCountdown(video);
        if (playBtn) {
          playBtn.innerHTML = PLAY_ICON;
        }
        if (autoplayEnabled) {
          restartAutoplay();
        }
      }
    }

    /* ── Video play/pause card click handler (delegated) ── */
    section.querySelector('.qorix-review-video-stack-swiper').addEventListener('click', function (e) {
      if (dragMoved) {
        dragMoved = false;
        return;
      }

      const card = e.target.closest('.qorix-review-video-stack-card');
      if (!card) return;
      e.stopPropagation();

      const video = card.querySelector('video.qorix-review-video-stack-bg');
      if (!video) return;
      const playBtn = card.querySelector('.qorix-review-video-stack-play');

      if (currentVideo === video && !video.paused) {
        pauseVideo(video, playBtn);
      } else {
        playVideo(video, playBtn);
      }

      /* ── Event bindings for state sync ── */
      function onPause() {
        if (currentVideo === video && playBtn) {
          playBtn.innerHTML = PLAY_ICON;
        }
      }
      function onPlay() {
        if (currentVideo === video && playBtn) {
          playBtn.innerHTML = PAUSE_ICON;
        }
      }
      function onEnded() {
        if (currentVideo === video) {
          stopCountdown(video, true);
          if (playBtn) {
            playBtn.innerHTML = PLAY_ICON;
          }
          currentVideo = null;
          if (autoplayEnabled) {
            restartAutoplay();
          }
        }
      }

      video.removeEventListener('pause', video._onPause);
      video.removeEventListener('play', video._onPlay);
      video.removeEventListener('ended', video._onEnded);

      video._onPause = onPause;
      video._onPlay = onPlay;
      video._onEnded = onEnded;

      video.addEventListener('pause', onPause);
      video.addEventListener('play', onPlay);
      video.addEventListener('ended', onEnded);
    });

    /* ── Autoplay on Hover logic ── */
    if (autoplayOnHover) {
      stackSlides.forEach(function (slide) {
        const card = slide.querySelector('.qorix-review-video-stack-card');
        if (!card) return;
        const video = card.querySelector('video.qorix-review-video-stack-bg');
        if (!video) return;
        const playBtn = card.querySelector('.qorix-review-video-stack-play');

        card.addEventListener('mouseenter', function () {
          playVideo(video, playBtn);
        });

        card.addEventListener('mouseleave', function () {
          pauseVideo(video, playBtn);
        });
      });
    }

    /* ── Dynamic Timer calculation from video metadata ── */
    const videos = section.querySelectorAll('video.qorix-review-video-stack-bg');
    videos.forEach((video) => {
      const updateDuration = () => {
        const duration = video.duration;
        if (!isNaN(duration)) {
          video.dataset.totalDuration = duration;
          const card = video.closest('.qorix-review-video-stack-card');
          if (card) {
            const durationSpan = card.querySelector('.qorix-review-video-stack-pill span');
            if (durationSpan) {
              durationSpan.textContent = formatTime(duration);
            }
          }
        }
      };
      if (video.readyState >= 1) {
        updateDuration();
      } else {
        video.addEventListener('loadedmetadata', updateDuration);
      }
    });

    /* ── Swipe/Drag Gesture Handling ── */
    const swiperContainer = section.querySelector('.qorix-review-video-stack-swiper');
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (x) => {
      startX = x;
      currentX = x;
      isDragging = true;
      dragMoved = false;
    };

    const handleTouchMove = (x) => {
      if (!isDragging) return;
      currentX = x;
      if (Math.abs(currentX - startX) > 10) {
        dragMoved = true;
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      const diffX = currentX - startX;
      const threshold = 50; // threshold to trigger transition
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          goToVideo(activeVideoIndex - 1);
        } else {
          goToVideo(activeVideoIndex + 1);
        }
      }
    };

    swiperContainer.addEventListener(
      'touchstart',
      (e) => {
        handleTouchStart(e.touches[0].clientX);
      },
      { passive: true }
    );

    swiperContainer.addEventListener(
      'touchmove',
      (e) => {
        handleTouchMove(e.touches[0].clientX);
      },
      { passive: true }
    );

    swiperContainer.addEventListener('touchend', () => {
      handleTouchEnd();
    });

    swiperContainer.addEventListener('mousedown', (e) => {
      handleTouchStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      handleTouchMove(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      handleTouchEnd();
    });

    /* ── Initialise ── */
    initPagination();
    renderStack();
    if (autoplayEnabled) {
      restartAutoplay();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoStack);
  } else {
    initVideoStack();
  }
})();