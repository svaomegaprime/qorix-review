(function () {
  const PLAY_ICON =
    '<svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M1 1L9 6L1 11V1Z" fill="#303030"/></svg>';
  const PAUSE_ICON =
    '<svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect width="3" height="12" fill="#303030"/><rect x="7" width="3" height="12" fill="#303030"/></svg>';

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return m + ':' + s;
  }

  class VideoStackWidget {
    constructor(section) {
      this.section = section;
      this.currentVideo = null;
      this.autoplayTimer = null;
      this.dragMoved = false;
      this.stackSlides = [];
      this.stackDots = [];
      this.activeVideoIndex = 0;
      this.navCols = 5;
      this.halfCols = 2;
      this.showLoopVideo = true;
      this.autoplayEnabled = true;
      this.autoplaySpeed = 3000;
      this.autoplayOnHover = true;
      this.mutedByDefault = true;

      this.init();
    }

    init() {
      let metafieldData = {};
      try {
        const rawMeta = this.section.getAttribute('data-video-stack-metafield');
        if (rawMeta) {
          metafieldData = JSON.parse(rawMeta);
        }
      } catch (_e) {
        /* ignore JSON parse error */
      }

      const computedStyle = getComputedStyle(this.section);
      this.navCols = metafieldData.thumbnailsShown
        ? parseInt(metafieldData.thumbnailsShown, 10)
        : (parseInt(computedStyle.getPropertyValue('--nav-cols').trim(), 10) || 5);
      this.showLoopVideo = metafieldData.showLoopVideo !== undefined
        ? Boolean(metafieldData.showLoopVideo)
        : true;
      this.autoplayEnabled = this.showLoopVideo;
      this.autoplayOnHover = metafieldData.autoplayOnHover !== undefined
        ? Boolean(metafieldData.autoplayOnHover)
        : true;
      this.mutedByDefault = metafieldData.mutedByDefault !== undefined
        ? Boolean(metafieldData.mutedByDefault)
        : true;

      this.paginationContainer = this.section.querySelector('.qorix-review-video-stack-custom-pagination');
      this.stackPrev = this.section.querySelector('.qorix-review-video-stack-nav-prev');
      this.stackNext = this.section.querySelector('.qorix-review-video-stack-nav-next');
      this.swiperEl = this.section.querySelector('.qorix-review-video-stack-swiper');

      if (!this.swiperEl) return;

      this.setupOneTimeEvents();
      this.refresh();
    }

    getEffectiveCols() {
      if (window.innerWidth <= 1024) return 3;
      return this.navCols;
    }

    computeCardWidths() {
      const cols = this.getEffectiveCols();
      this.halfCols = Math.floor(cols / 2);

      const containerWidth = this.swiperEl.offsetWidth;
      const gapVal = parseFloat(getComputedStyle(this.swiperEl).getPropertyValue('--gap')) || 20;
      const half = Math.floor(cols / 2);
      const isMobileFocus = window.innerWidth <= 610;

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

      this.swiperEl.style.setProperty('--card-w-center', centerW + 'px');
      this.swiperEl.style.setProperty('--card-w-adjacent', adjacentW + 'px');
      this.swiperEl.style.setProperty('--card-w-outer', outerW + 'px');
    }

    startCountdown(video) {
      const card = video.closest('.qorix-review-video-stack-card');
      if (!card) return;
      const pillSpan = card.querySelector('.qorix-review-video-stack-pill span');
      if (!pillSpan) return;

      if (!video.dataset.totalDuration && !isNaN(video.duration)) {
        video.dataset.totalDuration = video.duration;
      }

      const onTimeUpdate = () => {
        const remaining = Math.max(0, video.duration - video.currentTime);
        pillSpan.textContent = formatTime(remaining);
      };

      if (video._timeUpdateHandler) {
        video.removeEventListener('timeupdate', video._timeUpdateHandler);
      }
      video._timeUpdateHandler = onTimeUpdate;
      video.addEventListener('timeupdate', onTimeUpdate);
    }

    stopCountdown(video, restoreTotal) {
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

    getStackOffset(index, activeIndex, total) {
      let offset = index - activeIndex;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      return offset;
    }

    renderStack() {
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

      this.stackSlides.forEach((slide, index) => {
        slide.classList.remove(...positionClasses);
        slide.style.transform = '';
        slide.style.zIndex = '';

        const offset = this.getStackOffset(index, this.activeVideoIndex, this.stackSlides.length);
        if (Math.abs(offset) > this.halfCols) return;

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
          const style = getComputedStyle(this.swiperEl);
          const dOuter = parseFloat(style.getPropertyValue('--d-outer')) || 0;
          const cardWOuter = parseFloat(style.getPropertyValue('--card-w-outer')) || 0;
          const gap = parseFloat(style.getPropertyValue('--gap')) || 20;
          const distance = dOuter + (Math.abs(offset) - 2) * (cardWOuter + gap);
          const sign = offset > 0 ? '' : '-';
          slide.style.transform = 'translate(calc(' + sign + distance + 'px - var(--card-w-center) / 2), -50%)';
          slide.style.zIndex = 1;
        }
      });

      this.updatePagination(this.activeVideoIndex);
    }

    initPagination() {
      if (!this.paginationContainer) return;
      this.paginationContainer.innerHTML = '';
      this.stackDots = [];
      for (let i = 0; i < this.stackSlides.length; i++) {
        const dot = document.createElement('button');
        dot.className = 'qorix-review-video-stack-dot';
        dot.type = 'button';
        dot.dataset.index = i;
        dot.setAttribute('aria-label', 'Show video ' + (i + 1));
        dot.addEventListener('click', () => {
          this.goToVideo(parseInt(dot.dataset.index, 10));
        });
        this.paginationContainer.appendChild(dot);
        this.stackDots.push(dot);
      }
    }

    updatePagination(activeIndex) {
      this.stackDots.forEach((dot) => {
        dot.classList.remove('active');
      });
      if (this.stackDots[activeIndex]) this.stackDots[activeIndex].classList.add('active');
    }

    stopCurrentVideo() {
      if (this.currentVideo) {
        this.currentVideo.pause();
        this.currentVideo.muted = true;
        this.currentVideo.setAttribute('loop', '');
        this.stopCountdown(this.currentVideo, true);
        const card = this.currentVideo.closest('.qorix-review-video-stack-card');
        if (card) {
          const playBtn = card.querySelector('.qorix-review-video-stack-play');
          if (playBtn) {
            playBtn.innerHTML = PLAY_ICON;
            playBtn.style.display = '';
          }
        }
        this.currentVideo = null;
      }
    }

    goToVideo(index) {
      this.stopCurrentVideo();
      const total = this.stackSlides.length;
      if (total === 0) return;
      this.activeVideoIndex = ((index % total) + total) % total;
      this.renderStack();
      if (this.autoplayEnabled) {
        this.restartAutoplay();
      }
    }

    restartAutoplay() {
      window.clearInterval(this.autoplayTimer);
      if (this.stackSlides.length <= 1) return;
      this.autoplayTimer = window.setInterval(() => {
        this.goToVideo(this.activeVideoIndex + 1);
      }, this.autoplaySpeed);
    }

    stopAutoplay() {
      window.clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }

    playVideo(video, playBtn) {
      if (this.currentVideo && this.currentVideo !== video) {
        this.stopCurrentVideo();
      }

      video.setAttribute('loop', '');
      video.muted = this.mutedByDefault;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.currentVideo = video;
            this.startCountdown(video);
            if (playBtn) {
              playBtn.innerHTML = PAUSE_ICON;
            }
            this.stopAutoplay();
          })
          .catch((error) => {
            console.log('Video play failed: ', error);
            if (!video.muted) {
              video.muted = true;
              video.play().then(() => {
                this.currentVideo = video;
                this.startCountdown(video);
                if (playBtn) playBtn.innerHTML = PAUSE_ICON;
                this.stopAutoplay();
              }).catch((e) => {
                console.log('Fallback muted play failed:', e);
              });
            }
          });
      }
    }

    pauseVideo(video, playBtn) {
      if (this.currentVideo === video) {
        video.pause();
        this.stopCountdown(video);
        if (playBtn) {
          playBtn.innerHTML = PLAY_ICON;
        }
        this.currentVideo = null;
        if (this.autoplayEnabled) {
          this.restartAutoplay();
        }
      }
    }

    setupHoverAutoplay() {
      if (!this.autoplayOnHover) return;
      this.stackSlides.forEach((slide) => {
        const card = slide.querySelector('.qorix-review-video-stack-card');
        if (!card || card._hoverAttached) return;
        card._hoverAttached = true;
        const video = card.querySelector('video.qorix-review-video-stack-bg');
        if (!video) return;
        const playBtn = card.querySelector('.qorix-review-video-stack-play');

        card.addEventListener('mouseenter', () => {
          this.playVideo(video, playBtn);
        });

        card.addEventListener('mouseleave', () => {
          this.pauseVideo(video, playBtn);
        });
      });
    }

    setupVideoTimers() {
      const videos = this.section.querySelectorAll('video.qorix-review-video-stack-bg');
      videos.forEach((video) => {
        if (video._durationAttached) return;
        video._durationAttached = true;
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
    }

    setupOneTimeEvents() {
      window.addEventListener('resize', () => {
        this.computeCardWidths();
        this.renderStack();
      });

      if (this.stackPrev) {
        this.stackPrev.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.goToVideo(this.activeVideoIndex - 1);
        });
      }
      if (this.stackNext) {
        this.stackNext.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.goToVideo(this.activeVideoIndex + 1);
        });
      }

      this.swiperEl.addEventListener('click', (e) => {
        if (this.dragMoved) {
          this.dragMoved = false;
          return;
        }

        const card = e.target.closest('.qorix-review-video-stack-card');
        if (!card) return;
        e.stopPropagation();

        const video = card.querySelector('video.qorix-review-video-stack-bg');
        if (!video) return;
        const playBtn = card.querySelector('.qorix-review-video-stack-play');

        if (this.currentVideo === video && !video.paused) {
          this.pauseVideo(video, playBtn);
        } else {
          this.playVideo(video, playBtn);
        }

        const onPause = () => {
          if (this.currentVideo === video && playBtn) {
            playBtn.innerHTML = PLAY_ICON;
          }
        };
        const onPlay = () => {
          if (this.currentVideo === video && playBtn) {
            playBtn.innerHTML = PAUSE_ICON;
          }
        };
        const onEnded = () => {
          if (this.currentVideo === video) {
            this.stopCountdown(video, true);
            if (playBtn) {
              playBtn.innerHTML = PLAY_ICON;
            }
            this.currentVideo = null;
            if (this.autoplayEnabled) {
              this.restartAutoplay();
            }
          }
        };

        if (video._onPause) video.removeEventListener('pause', video._onPause);
        if (video._onPlay) video.removeEventListener('play', video._onPlay);
        if (video._onEnded) video.removeEventListener('ended', video._onEnded);

        video._onPause = onPause;
        video._onPlay = onPlay;
        video._onEnded = onEnded;

        video.addEventListener('pause', onPause);
        video.addEventListener('play', onPlay);
        video.addEventListener('ended', onEnded);
      });

      let startX = 0;
      let currentX = 0;
      let isDragging = false;

      const handleTouchStart = (x) => {
        startX = x;
        currentX = x;
        isDragging = true;
        this.dragMoved = false;
      };

      const handleTouchMove = (x) => {
        if (!isDragging) return;
        currentX = x;
        if (Math.abs(currentX - startX) > 10) {
          this.dragMoved = true;
        }
      };

      const handleTouchEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        const diffX = currentX - startX;
        const threshold = 50;
        if (Math.abs(diffX) > threshold) {
          if (diffX > 0) {
            this.goToVideo(this.activeVideoIndex - 1);
          } else {
            this.goToVideo(this.activeVideoIndex + 1);
          }
        }
      };

      this.swiperEl.addEventListener(
        'touchstart',
        (e) => {
          handleTouchStart(e.touches[0].clientX);
        },
        { passive: true }
      );

      this.swiperEl.addEventListener(
        'touchmove',
        (e) => {
          handleTouchMove(e.touches[0].clientX);
        },
        { passive: true }
      );

      this.swiperEl.addEventListener('touchend', () => {
        handleTouchEnd();
      });

      this.swiperEl.addEventListener('mousedown', (e) => {
        handleTouchStart(e.clientX);
      });

      window.addEventListener('mousemove', (e) => {
        handleTouchMove(e.clientX);
      });

      window.addEventListener('mouseup', () => {
        handleTouchEnd();
      });
    }

    refresh() {
      this.stackSlides = Array.from(this.section.querySelectorAll('.qorix-review-video-stack-swiper-slide'));
      if (this.stackSlides.length === 0) {
        if (this.paginationContainer) this.paginationContainer.innerHTML = '';
        this.stopAutoplay();
        return;
      }

      this.computeCardWidths();
      this.initPagination();
      this.activeVideoIndex = Math.min(this.halfCols, Math.max(0, this.stackSlides.length - 1));
      this.renderStack();
      this.setupHoverAutoplay();
      this.setupVideoTimers();
      if (this.autoplayEnabled) {
        this.restartAutoplay();
      }
    }
  }

  function initVideoStack() {
    document.querySelectorAll('[data-section="qorix-review-video-stack-widget"]').forEach((section) => {
      if (!section._videoStackInstance) {
        section._videoStackInstance = new VideoStackWidget(section);
      } else {
        section._videoStackInstance.refresh();
      }
    });
  }

  window.initVideoStack = initVideoStack;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoStack);
  } else {
    initVideoStack();
  }
})();