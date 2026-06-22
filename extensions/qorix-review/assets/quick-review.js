function quickReviewWidget() {
  return {
    ratings: [1, 2, 3, 4, 5],
    sortOptions: [
      "Highest rating",
      "Lowest rating",
      "Only pictures",
      "Pictures first",
      "Videos first",
      "Most helpful",
    ],
    activeFilter: "all",
    activeSort: "Highest rating",
    filtersOpen: true,
    sortOpen: false,
    modalOpen: false,
    submitSuccess: false,
    starSelected: 0,
    starHover: 0,
    isDragging: false,
    uploadedFiles: [],
    form: {
      name: "",
      email: "",
      review: "",
    },
    lightboxOpen: false,
    lightboxMedia: null,

    reviews: [
      {
        id: 1,
        rating: 4,
        name: "Abdur Razzak",
        avatar: "https://i.ibb.co.com/7PwsYSL/raju.jpg",
        time: "2 days ago",
        product: "Hydrating Eye Cream",
        review:
          "Good results, noticed a difference in about a week. Fast shipping too.",
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200",
          },
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200",
          },
          {
            type: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumb:
              "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=200",
          },
        ],
        verified: true,
      },
      {
        id: 2,
        rating: 5,
        name: "Abir Rayhan",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80",
        time: "5 hours ago",
        product: "Hydrating Eye Cream",
        review:
          "Good results, noticed a difference in about a week. Fast shipping too.",
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200",
          },
          {
            type: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumb:
              "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200",
          },
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=200",
          },
        ],
        verified: true,
      },
      {
        id: 3,
        rating: 5,
        name: "Osman Hasan",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80",
        time: "1 week ago",
        product: "Hydrating Eye Cream",
        review:
          "Good results, noticed a difference in about a week. Fast shipping too.",
        media: [
          {
            type: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumb:
              "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200",
          },
          {
            type: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumb:
              "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200",
          },
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=200",
          },
        ],
        verified: false,
      },
      {
        id: 4,
        rating: 3,
        name: "Nadia Islam",
        avatar: null,
        time: "3 days ago",
        product: "Hydrating Eye Cream",
        review:
          "It's okay, not what I expected but does the job. Packaging was nice.",
        media: [],
        verified: true,
      },
      {
        id: 5,
        rating: 5,
        name: "Tanvir Ahmed",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80",
        time: "2 weeks ago",
        product: "Hydrating Eye Cream",
        review:
          "Absolutely love this product! My skin feels amazing after just a few days.",
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200",
          },
        ],
        verified: true,
      },
      {
        id: 6,
        rating: 1,
        name: "Sadia Akter",
        avatar: null,
        time: "1 month ago",
        product: "Hydrating Eye Cream",
        review: "Did not work for me at all. Returned the product.",
        media: [],
        verified: false,
      },
      {
        id: 7,
        rating: 2,
        name: "Rahim Uddin",
        avatar: null,
        time: "3 weeks ago",
        product: "Hydrating Eye Cream",
        review:
          "Shipping was slow and the product did not meet my expectations.",
        media: [
          {
            type: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumb:
              "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200",
          },
        ],
        verified: true,
      },
    ],

    async submitReview(event) {
      if (
        !this.starSelected ||
        !this.form.name.trim() ||
        !this.form.review.trim()
      ) {
        alert("Please fill in all required fields and select a star rating.");
        return;
      }
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
        formData.append("name", this.form.name);
        formData.append("email", this.form.email);
        formData.append("review", this.form.review);
        formData.append("rating", this.starSelected);

        // Images & Videos
        this.uploadedFiles.forEach((item) => {
          formData.append("media", item.file);
        });

        console.log("Submitting...", formData);

        const response = await fetch("/apps/api/review", {
          method: "POST",
          body: formData,
          
        });

        if (!response.ok) {
          throw new Error("Failed to submit review");
        }

        const result = await response.json();

        console.log("Review submit result", result);
        console.log("Uploaded media URLs", result.urls || []);

        this.submitSuccess = true;

        this.$nextTick(() => {
          if (this.$refs.modalBox) {
            this.$refs.modalBox.scrollTop = 0;
          }
        });
      } catch (error) {
        console.error(error);
        alert("Failed to submit review");
      }
    },

    avgScore() {
      const total = this.reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      return (total / this.reviews.length).toFixed(1);
    },

    initials(name) {
      return name ? name.charAt(0) : "";
    },

    hasMediaType(review, type) {
      return review.media.some((media) => media.type === type);
    },

    filteredReviews() {
      let list = this.reviews.slice();

      if (this.activeFilter !== "all") {
        list = list.filter((review) => review.rating === this.activeFilter);
      }

      if (this.activeSort === "Highest rating") {
        list.sort((a, b) => b.rating - a.rating);
      } else if (this.activeSort === "Lowest rating") {
        list.sort((a, b) => a.rating - b.rating);
      } else if (this.activeSort === "Only pictures") {
        list = list.filter((review) => this.hasMediaType(review, "image"));
      } else if (this.activeSort === "Pictures first") {
        list.sort(
          (a, b) =>
            Number(this.hasMediaType(b, "image")) -
            Number(this.hasMediaType(a, "image")),
        );
      } else if (this.activeSort === "Videos first") {
        list.sort(
          (a, b) =>
            Number(this.hasMediaType(b, "video")) -
            Number(this.hasMediaType(a, "video")),
        );
      }

      return list;
    },

    setSort(option) {
      this.activeSort = option;
      this.sortOpen = false;
    },

    openModal() {
      this.starSelected = 0;
      this.starHover = 0;
      this.submitSuccess = false;
      this.form = {
        name: "",
        email: "",
        review: "",
      };
      this.clearUploadedFiles();
      this.modalOpen = true;
    },

    closeModal() {
      this.modalOpen = false;
    },

    overlayClick(event) {
      if (event.target.id === "modal-overlay") {
        this.closeModal();
      }
    },

    handleMediaUpload(event) {
      this.addFiles(event.target.files);
      event.target.value = "";
    },

    handleDrop(event) {
      this.isDragging = false;
      this.addFiles(event.dataTransfer.files);
    },

    addFiles(files) {
      Array.from(files).forEach((file) => {
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
    },

    removeMedia(index) {
      const item = this.uploadedFiles[index];

      if (item) {
        URL.revokeObjectURL(item.url);
      }

      this.uploadedFiles.splice(index, 1);
    },

    clearUploadedFiles() {
      this.uploadedFiles.forEach((item) => URL.revokeObjectURL(item.url));
      this.uploadedFiles = [];
    },

    openLightbox(media) {
      this.lightboxMedia = media;
      this.lightboxOpen = true;
      document.body.style.overflow = "hidden";
    },

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
    },

    init() {
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          this.closeLightbox();
        }
      });
    },
  };
}
