class QuickReviewWidget {
  constructor() {
    this.ratings = [1, 2, 3, 4, 5];

    this.sortOptions = [
      { label: "All Review", value: "ALL" },
      { label: "Most recent", value: "MOST_RECENT" },
      { label: "Highest rating", value: "HIGHEST_RATING" },
      { label: "Lowest rating", value: "LOWEST_RATING" },
      { label: "Only pictures", value: "ONLY_PICTURES" },
      { label: "Only video", value: "ONLY_VIDEO" },
      { label: "Most helpful", value: "MOST_HELPFUL" },
    ];

    this.activeFilter = "ALL";
    this.activeSort = "MOST_RECENT";
    this.filtersOpen = false;
    this.sortOpen = false;
    this.modalOpen = false;
    this.submitSuccess = false;
    this.isError = false;
    this.errorMessage = "";
    this.starSelected = 0;
    this.starHover = 0;
    this.isDragging = false;
    this.allowPhotoUpload = true;
    this.allowVideoUpload = true;
    this.uploadedFiles = [];
    this.showAllMedia = false;

    this.form = {
      name: "",
      email: "",
      review: "",
    };

    this.lightboxOpen = false;
    this.lightboxMedia = null;
    this.product = {};
    this.customerId = "";
    this.customerEmail = "";
    this.loading = false;
    this.dataPostLoading = false;

    this.reviews = [
      {
        id: 1,
        rating: 4,
        reviewerName: "Abdur Razzak",
        avatar: "https://i.ibb.co.com/7PwsYSL/raju.jpg",
        createdAt: null,
        productTitle: "Hydrating Eye Cream",
        body: "Good results, noticed a difference in about a week. Fast shipping too.",
        attachments: [
          {
            type: "IMAGE",
            url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200",
          },
          {
            type: "IMAGE",
            url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200",
          },
          {
            type: "VIDEO",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
        ],
        isVerified: true,
      },
    ];

    this.currentPage = 1;
    this.limit = 10;
    this.baseLimit = 10;
    this.totalPages = 1;
    this.totalReviews = 0;
    this.averageRating = 0;
    this.sort = "ALL";
    this.starCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    // Alpine.js refs / $nextTick are only available when this class is
    // used as an x-data object. If you're using Alpine, keep these;
    // otherwise remove references to this.$refs / this.$nextTick below.
    this.$refs = this.$refs || {};
    this.attachments = [];
    this.showFirst = "";
  }

  reinitSwipers() {
    if (this.$nextTick) {
      this.$nextTick(() => {
        if (typeof window.initQuoteLoopSwiper === "function") {
          window.initQuoteLoopSwiper();
        }
        if (typeof window.initVideoStack === "function") {
          window.initVideoStack();
        }
      });
    } else {
      setTimeout(() => {
        if (typeof window.initQuoteLoopSwiper === "function") {
          window.initQuoteLoopSwiper();
        }
        if (typeof window.initVideoStack === "function") {
          window.initVideoStack();
        }
      }, 50);
    }
  }

  initUploadSettings(el) {
    console.log("EFT", el);
    this.allowPhotoUpload = el.dataset.photoUpload === "true";
    this.allowVideoUpload = el.dataset.videoUpload === "true";
    this.customerId =
      el.dataset.customerId || el.getAttribute("customerId") || "";
    this.customerEmail =
      el.dataset.customerEmail || el.getAttribute("customerEmail") || "";
    this.showFirst = el.dataset.showFirst || el.getAttribute("showFirst") || "";
  }

  isAllowedMediaFile(file) {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (isImage && this.allowPhotoUpload) {
      return true;
    }

    if (isVideo && this.allowVideoUpload) {
      return true;
    }

    return false;
  }

  async productInit(productJson, defaultSort, limit) {
    console.log("productInit called", productJson);
    try {
      this.limit = Number(limit) || 10;
      this.baseLimit = this.limit;
      this.sort = defaultSort;

      if (!productJson) {
        console.warn("No product JSON found");
        return;
      }

      this.product = JSON.parse(productJson);
      console.log("parsed product", this.product);

      await this.getReview(defaultSort);
    } catch (error) {
      console.error("Quick review init failed", error);
    }
  }

  async getReview(defaultSort) {
    this.loading = true;
    try {
      const productId = this.product?.id || "";
      const openFromEmail = window.location.search.includes("isOpen=true");
      const orderId = new URLSearchParams(window.location.search).get(
        "orderId",
      );
      const customerEmail = this.customerEmail || "";

      const response = await fetch(
        `/apps/qorix-review/review?productId=${encodeURIComponent(productId)}&sort=${encodeURIComponent(defaultSort)}&page=${this.currentPage}&limit=${this.limit}&isOpen=${openFromEmail}&orderId=${orderId}&customerEmail=${encodeURIComponent(customerEmail)}`,
        {
          method: "GET",
        },
      );

      const result = await response.json();

      if (!response.ok || result.ok === false) {
        throw new Error(result.message || "Failed to fetch reviews");
      }

      this.reviews = (result.data?.reviews || [])
        .map((review) => this.withHelpfulState(review, customerEmail))
        .filter((review) => {
          if (this.showFirst === "VIDEO") {
            return (
              (review.attachments || []).some(
                (att) =>
                  att.type === "VIDEO" || att.url?.match(/\.(mp4|webm|mov)$/i),
              ) || review.video_url
            );
          }
          return true;
        })
        .sort((a, b) => {
          if (this.showFirst === "IMAGE_VIDEO") {
            const aHasAttachment = (a.attachments?.length || 0) > 0;
            const bHasAttachment = (b.attachments?.length || 0) > 0;

            if (aHasAttachment === bHasAttachment) return 0;

            return aHasAttachment ? -1 : 1;
          } else {
            return 0;
          }
        });
      this.currentPage = result.data?.currentPage ?? 1;
      this.totalPages = result.data?.totalPages ?? 1;
      this.totalReviews = result.data?.totalReviews ?? 0;
      this.averageRating = result.data?.averageRating.toFixed(1) ?? 0.0;
      this.starCount = result.data?.ratingCounts ?? {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };
      this.attachments = result.data?.attachments ?? [];

      this.reinitSwipers();

      console.log("GET Review:", result);
      return result;
    } finally {
      this.loading = false;
    }
  }

  withHelpfulState(review, customerEmail = this.customerEmail) {
    const helpfulCount = Array.isArray(review.helpfulCount)
      ? review.helpfulCount
      : [];
    const normalizedCustomerEmail = String(customerEmail || "").toLowerCase();
    const helpfulTotal = helpfulCount.reduce((total, item) => {
      return item?.isHelpful === true ? total + 1 : total;
    }, 0);
    const isHelpful = Boolean(
      normalizedCustomerEmail &&
      helpfulCount.some((item) => {
        return (
          item?.isHelpful === true &&
          String(item.customerEmail || "").toLowerCase() ===
            normalizedCustomerEmail
        );
      }),
    );

    return {
      ...review,
      helpfulTotal,
      isHelpful,
    };
  }

  async helpfulToggle(
    review,
    customerId = this.customerId,
    customerEmail = this.customerEmail,
  ) {
    const reviewId = typeof review === "object" ? review.id : review;
    const currentReview =
      typeof review === "object"
        ? review
        : this.reviews.find((item) => item.id === reviewId);
    const isHelpful = !currentReview?.isHelpful;

    console.log({ reviewId, customerId, customerEmail, isHelpful });

    if (!reviewId || !customerId || !customerEmail) {
      window.location.href = "/account";
      return;
    }

    try {
      const response = await fetch("/apps/qorix-review/helpful", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          customerId,
          customerEmail,
          isHelpful,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.ok === false) {
        throw new Error(data.message || "Failed to update helpful");
      }

      if (currentReview) {
        const wasHelpful = Boolean(currentReview.isHelpful);
        currentReview.isHelpful = data.data?.isHelpful ?? isHelpful;

        if (currentReview.isHelpful !== wasHelpful) {
          currentReview.helpfulTotal = Math.max(
            0,
            (currentReview.helpfulTotal || 0) +
              (currentReview.isHelpful ? 1 : -1),
          );
        }
      }

      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  async shareReview(review) {
    const shareUrl = `${window.location.href.split("#")[0]}/products/${review.productHandle}`;
    const shareData = {
      title: document.title,
      text: "Check out this review!",
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard");
      } catch (err) {
        console.log(err);
      }
    }
  }
  getRatingCounts() {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    this.reviews.forEach((review) => {
      const rating = Number(review.rating);
      if (counts[rating] !== undefined) {
        counts[rating]++;
      }
    });

    return counts;
  }

  async submitReview() {
    if (!this.product) return;
    const product = this.product || {};
    console.log("999090088888888", product);
    const openFromEmail = window.location.search.includes("isOpen=true");
    const orderId = new URLSearchParams(window.location.search).get("orderId");

    if (
      !this.starSelected ||
      !this.form.name.trim() ||
      !this.form.review.trim()
    ) {
      this.isError = true;
      this.errorMessage =
        "Please fill in all required fields and select a star rating.";
      return;
    }

    this.isError = false;
    this.errorMessage = "";
    this.dataPostLoading = true;
    console.log(
      this.form.name,
      this.form.email,
      this.form.review,
      this.starSelected,
      this.uploadedFiles,
    );

    try {
      const formData = new FormData();

      // Text fields
      formData.append("reviewerName", this.form.name);
      formData.append("reviewerEmail", this.form.email);
      formData.append("body", this.form.review);
      formData.append("rating", this.starSelected);

      formData.append("productId", product.id ?? "");
      formData.append("productHandle", product.handle ?? "");
      formData.append("productTitle", product.title ?? "");

      formData.append("source", "PRODUCT_PAGE");
      formData.append("submittedAt", new Date().toISOString());

      // Images & Videos
      this.uploadedFiles.forEach((item) => {
        formData.append("media", item.file);
      });

      console.log("Submitting...", formData);

      const response = await fetch(
        `/apps/qorix-review/review?isOpen=${openFromEmail}&orderId=${orderId}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok || result.ok === false) {
        throw new Error(result.message || "Failed to submit review");
      }

      console.log("Review submit result", result);
      console.log("Uploaded media URLs", result.urls || []);

      this.submitSuccess = true;
      this.isError = false;
      this.errorMessage = "";

      this.reviews = [this.withHelpfulState(result.data), ...this.reviews];
      this.totalReviews++;
      const newRating =
        (this.averageRating * (this.totalReviews - 1) + this.starSelected) /
        this.totalReviews;
      this.averageRating = Number(newRating.toFixed(1));

      if (this.$nextTick) {
        this.$nextTick(() => {
          if (this.$refs.modalBox) {
            this.$refs.modalBox.scrollTop = 0;
          }
        });
      }
      this.reinitSwipers();
      this.dataPostLoading = false;
    } catch (error) {
      console.error(error);
      this.dataPostLoading = false;
      this.isError = true;
      this.errorMessage = error.message || "Failed to submit review";
    }
  }

  closeErrorModal() {
    this.isError = false;
    this.errorMessage = "";
  }

  changePage(page) {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.getReview(this.sort);
  }

  loadMore() {
    this.limit += this.baseLimit;
    this.currentPage = 1;
    this.getReview(this.sort);
  }

  hasMoreReviews() {
    return this.reviews.length < this.totalReviews;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getReview(this.sort);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getReview(this.sort);
    }
  }

  timeAgo(date) {
    if (!date) return "Recently";

    const d = new Date(date);

    if (isNaN(d.getTime())) return "Recently";

    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);

      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
      }
    }

    return "Just now";
  }

  initials(name) {
    return name ? name.charAt(0) : "";
  }

  hasMediaType(review, type) {
    return review.attachments.some((media) => media.type === type);
  }

  filteredReviews() {
    if (this.activeFilter === "ALL") {
      return this.reviews;
    }

    const rating = Number(this.activeFilter);

    return this.reviews.filter((review) => Number(review.rating) === rating);
  }

  setRatingFilter(rating) {
    this.activeFilter = rating;
    this.reinitSwipers();
  }

  async setSort(option) {
    this.activeSort = option;
    this.sortOpen = false;
    this.sort = option;
    this.limit = this.baseLimit;
    this.currentPage = 1;
    await this.getReview(option);
  }

  openModal() {
    this.starSelected = 0;
    this.starHover = 0;
    this.submitSuccess = false;
    this.isError = false;
    this.errorMessage = "";
    this.form = {
      name: "",
      email: "",
      review: "",
    };
    this.clearUploadedFiles();
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  overlayClick(event) {
    if (event.target.id === "modal-overlay") {
      this.closeModal();
    }
  }

  handleMediaUpload(event) {
    this.addFiles(event.target.files);
    event.target.value = "";
  }

  handleDrop(event) {
    this.isDragging = false;
    this.addFiles(event.dataTransfer.files);
  }

  addFiles(files) {
    if (Array.from(files).length > 5) {
      alert("Max 5 file upload");
      return;
    }

    Array.from(files).forEach((file) => {
      if (!this.isAllowedMediaFile(file)) {
        alert(file.name + " is not an allowed file type.");
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        alert(file.name + " is too large. Max 20MB.");
        return;
      }

      this.uploadedFiles.push({
        file,
        name: file.name,
        url: URL.createObjectURL(file),
        isVideo: file.type.startsWith("video/"),
      });
    });
  }

  removeMedia(index) {
    const item = this.uploadedFiles[index];

    if (item) {
      URL.revokeObjectURL(item.url);
    }

    this.uploadedFiles.splice(index, 1);
  }

  clearUploadedFiles() {
    this.uploadedFiles.forEach((item) => URL.revokeObjectURL(item.url));
    this.uploadedFiles = [];
  }

  openLightbox(media) {
    console.log(media);
    this.lightboxMedia = media;
    this.lightboxOpen = true;
    document.body.style.overflow = "hidden";
  }

  closeLightbox(event) {
    if (
      event &&
      event.target.id !== "lightbox" &&
      !event.target.classList.contains("lightbox-close")
    ) {
      return;
    }

    this.lightboxOpen = false;
    this.lightboxMedia = null;
    document.body.style.overflow = "";
  }

  // init() {
  //   document.addEventListener("keydown", (event) => {
  //     if (event.key === "Escape") {
  //       this.closeLightbox();
  //     }
  //   });
  // }
}

// Alpine.js usage: x-data="new QuickReviewWidget()"
// Plain JS usage:  const widget = new QuickReviewWidget(); widget.init();

window.ReviewWidget = () => new QuickReviewWidget();

// export default QuickReviewWidget;
