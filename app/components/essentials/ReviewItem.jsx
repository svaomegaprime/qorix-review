import starFilled from "../../assets/images/star-filled.svg";
import starEmpty from "../../assets/images/star-empty.svg";
import { useEffect, useRef, useState } from "react";

export default function ReviewItem({
  data,
  handleStatusUpdate,
  handleReviewDelete,
  handleReviewReply,
}) {
  // Start----State for attachment modal
  const activeThumbRef = useRef(null);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [activeAttachmentIndex, setActiveAttachmentIndex] = useState(0);
  const [replyReview, setReplyReview] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  // End----State for attachment modal
  // Start----State for count & manage attachments
  const attachments = data.attachments || [];
  const countAttachments = attachments.length;
  // End----State for count & manage attachments
  // Start----State for active attachment
  const activeAttachment = attachments[activeAttachmentIndex];
  // End----State for active attachment
  // Start----State for pagination
  const visibleAttachments = attachments.slice(0, 5);
  // End----State for pagination
  // Start----State for review status
  const replied = data.reply;
  const reply = data?.reply?.body;
  // End----State for review status

  useEffect(() => {
    if (replyReview) {
      setReplyBody(reply || "");
    }
  }, [replyReview, reply]);

  // Start----Review date
  const reviewDate = new Date(data.createdAt);

  const formatRelativeDate = (date) => {
    const diff = Date.now() - new Date(date).getTime();

    const units = [
      { label: "year", value: 1000 * 60 * 60 * 24 * 365 },
      { label: "month", value: 1000 * 60 * 60 * 24 * 30 },
      { label: "day", value: 1000 * 60 * 60 * 24 },
      { label: "hour", value: 1000 * 60 * 60 },
      { label: "minute", value: 1000 * 60 },
    ];

    for (const unit of units) {
      const amount = Math.floor(diff / unit.value);

      if (amount > 0) {
        return `${amount} ${unit.label}${amount > 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  };

  const formattedReviewDate = formatRelativeDate(reviewDate);
  // End----Review date

  // Start----Handlers for attachment modal
  const openAttachmentModal = (index) => {
    setActiveAttachmentIndex(index);
    setIsAttachmentModalOpen(true);
  };

  const closeAttachmentModal = () => {
    setIsAttachmentModalOpen(false);
  };

  const handlePreviousAttachment = () => {
    if (countAttachments === 0) {
      return;
    }

    setActiveAttachmentIndex((currentIndex) =>
      currentIndex === 0 ? countAttachments - 1 : currentIndex - 1,
    );
  };

  const handleNextAttachment = () => {
    if (countAttachments === 0) {
      return;
    }

    setActiveAttachmentIndex((currentIndex) =>
      currentIndex === countAttachments - 1 ? 0 : currentIndex + 1,
    );
  };

  useEffect(() => {
    if (!isAttachmentModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeAttachmentModal();
      }

      if (event.key === "ArrowLeft") {
        handlePreviousAttachment();
      }

      if (event.key === "ArrowRight") {
        handleNextAttachment();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAttachmentModalOpen, countAttachments]);

  useEffect(() => {
    if (!isAttachmentModalOpen) {
      return;
    }

    activeThumbRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeAttachmentIndex, isAttachmentModalOpen]);
  // End----Handlers for attachment modal

  // Start----Handler for renderers attachments
  const renderAttachment = (attachment, isThumbnail = false) => {
    if (!attachment) return null;
    const mediaClassName = isThumbnail
      ? "reviewAttachmentMedia reviewAttachmentMediaThumbnail"
      : "reviewAttachmentMedia";

    if (attachment.type === "VIDEO") {
      return (
        <div className={mediaClassName} key={`video-${attachment.url}`}>
          <video
            key={attachment.url}
            src={attachment.url}
            controls={!isThumbnail}
            autoPlay={!isThumbnail}
            playsInline
          >
            <source src={attachment.url} type="video/mp4" />
          </video>
        </div>
      );
    }

    return (
      <div className={mediaClassName} key={`img-${attachment.url}`}>
        <img
          key={attachment.url}
          src={attachment.url}
          alt=""
          draggable={false}
        />
      </div>
    );
  };
  // End----Handler for renderers attachments

  // Start----Handler for renderers attachment text
  const attachmentText = (attachments) => {
    const imageCount =
      attachments?.filter((attachment) => attachment.type === "IMAGE").length ||
      0;
    const videoCount =
      attachments?.filter((attachment) => attachment.type === "VIDEO").length ||
      0;

    let text = "";
    if (imageCount > 0) {
      text += imageCount === 1 ? `${imageCount} image` : `${imageCount} images`;
    }
    if (videoCount > 0) {
      text += imageCount > 0 ? ", " : "";
      text += videoCount === 1 ? `${videoCount} video` : `${videoCount} videos`;
    }

    return text;
  };
  // End----Handler for renderers attachment text
  return (
    <>
      <style>
        {`
        .reviewAttachmentPreview {
          position: relative;
          display: block;
          inline-size: 55px;
          block-size: 55px;
          padding: 0;
          border: 0;
          border-radius: 7px;
          overflow: hidden;
          background: #a3a3a3;
          cursor: pointer;
      }

      .reviewAttachmentPreviewOverlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgb(0 0 0 / 35%);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
      }

      .reviewAttachmentMedia {
          width: 100%;
          height: 100%;
          min-width: 0;
          overflow: hidden;
      }

      .reviewAttachmentMedia img,
      .reviewAttachmentMedia video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
      }

      .reviewAttachmentDialogOverlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 28px;
          background: rgb(0 0 0 / 62%);
      }

      .reviewAttachmentDialog {
          position: relative;
          display: grid;
          gap: 14px;
          width: min(86vw, 880px);
          justify-items: center;
          background: white;
          padding: 15px;
          border-radius: 10px;
      }

      .reviewAttachmentDialogClose {
          position: fixed;
          inset-block-start: 18px;
          inset-inline-end: 22px;
          z-index: 1;
          display: grid;
          place-items: center;
          inline-size: 34px;
          block-size: 34px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #fff;
          cursor: pointer;
          font-size: 28px;
          line-height: 1;
      }

      .reviewAttachmentDialogStage {
          width: 100%;
          height: min(62vh, 520px);
          overflow: hidden;
          border-radius: 8px;
          background: #111;
          box-shadow: 0 18px 48px rgb(0 0 0 / 24%);
      }

      .reviewAttachmentDialogStage .reviewAttachmentMedia img,
      .reviewAttachmentDialogStage .reviewAttachmentMedia video {
          object-fit: contain;
      }

      .reviewAttachmentDialogControls {
          display: grid;
          grid-template-columns: auto minmax(0, auto) auto;
          align-items: center;
          justify-content: center;
          gap: 10px;
      }

      .reviewAttachmentDialogThumbs {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 56px;
        gap: 8px;
        max-inline-size: min(66vw, 420px);
        overflow-x: auto;
        padding: 2px 4px;
        scroll-behavior: smooth;
        scroll-snap-type: inline proximity;
        scrollbar-width: none;
      }

      .reviewAttachmentDialogThumbs::-webkit-scrollbar {
          display: none;
      }

      .reviewAttachmentDialogThumb {
          position: relative;
          inline-size: 56px;
          block-size: 56px;
          padding: 0;
          border: 2px solid rgb(255 255 255 / 72%);
          border-radius: 7px;
          overflow: hidden;
          background: #a3a3a3;
        cursor: pointer;
        scroll-snap-align: center;
      }

      .reviewAttachmentDialogThumb.is-active {
          border-color: #00a66f;
      }

      .reviewAttachmentThumbMore {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: rgb(0 0 0 / 48%);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
      }

      @media (max-width: 640px) {
          .reviewAttachmentDialogOverlay {
              padding: 16px;
          }

          .reviewAttachmentDialog {
              width: 100%;
          }

          .reviewAttachmentDialogStage {
              height: min(58vh, 420px);
          }

          .reviewAttachmentDialogControls {
              grid-template-columns: 1fr;
          }

          .reviewAttachmentDialogThumbs {
              max-inline-size: 100%;
          }
      }

        `}
      </style>
      <s-stack>
        {/* Start----Review header */}
        <s-stack
          direction="inline"
          gap="base"
          alignItems="center"
          justifyContent="space-between"
        >
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-avatar
              size="medium"
              borderRadius="full"
              src={data.reviewerAvatar}
            />
            <p style={{ wordBreak: "break-all", fontWeight: "600" }}>
              {data.reviewerName}
            </p>
          </s-stack>
          <s-text>{formattedReviewDate}</s-text>
        </s-stack>
        {/* End----Review header */}
        {/* Start----Review rating */}
        <s-grid
          gridTemplateColumns="repeat(5, 20px)"
          alignItems="center"
          paddingBlockStart="small"
        >
          {[...Array(data.rating)].map((_, index) => (
            <s-image key={index} src={starFilled} inlineSize="fill" />
          ))}
          {[...Array(5 - data.rating)].map((_, index) => (
            <s-image key={index} src={starEmpty} inlineSize="fill" />
          ))}
        </s-grid>
        {/* End----Review rating */}
        {/* Start----Review content */}
        <div style={{ display: "grid", gap: "4px", paddingTop: "7px" }}>
          {/* Start----Review title */}
          <p style={{ wordBreak: "break-all", fontWeight: "600" }}>
            {data.productTitle}
          </p>
          {/* End----Review title */}
          {/* Start----Review description */}
          <p style={{ wordBreak: "break-all" }}>{data.body}</p>
          {/* End----Review description */}
          {(replied || replyReview) && (
            <div
              style={{
                paddingLeft: "12px",
                position: "relative",
                margin: "4px 0",
                display: "grid",
                gap: "4px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "0",
                  top: "0",
                  width: "2px",
                  height: "100%",
                  backgroundColor: "rgba(0, 191, 122, 1)",
                }}
              />
              {replied && <s-heading>Your reply</s-heading>}
              {replied && !replyReview && (
                <s-paragraph color="subdued">{reply}</s-paragraph>
              )}
              {replyReview && (
                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                    gridTemplateColumns: "1fr auto",
                    maxWidth: "425px",
                    marginTop: replied ? "8px" : "0",
                  }}
                >
                  <s-text-field
                    onInput={(e) => setReplyBody(e.target.value)}
                    placeholder="Write your reply"
                    value={replyBody}
                  />
                  <s-button
                    onClick={() => {
                      handleReviewReply(data.id, replyBody);
                      setReplyReview(false);
                    }}
                    variant="primary"
                  >
                    Save
                  </s-button>
                </div>
              )}
            </div>
          )}
          {/* End----Review reply */}
        </div>
        {/* End----Review content */}
        {/* Start----Review attachments */}
        {countAttachments > 0 && (
          <>
            {/* Start----Review attachment preview item */}
            <s-grid
              gridTemplateColumns="repeat(auto-fit, minmax(55px, 55px))"
              gap="base"
              paddingBlockStart="small"
            >
              {visibleAttachments.map((attachment, index) => (
                <button
                  type="button"
                  key={`${data.id}-${index}`}
                  className="reviewAttachmentPreview"
                  onClick={() => openAttachmentModal(index)}
                >
                  {renderAttachment(attachment, true)}
                  <div className="reviewAttachmentPreviewOverlay">
                    {index === 4 && countAttachments > 5 ? (
                      <span>+{countAttachments - 5}</span>
                    ) : (
                      attachment.type === "VIDEO" && (
                        <>
                          <img
                            src="/icons/play-icon.png"
                            className="overlay-icon"
                            style={{
                              width: "20px",
                              height: "20px",
                            }}
                            alt="Play"
                          />
                        </>
                      )
                    )}
                  </div>
                </button>
              ))}
            </s-grid>
            {/* End----Review attachment preview item */}
            {/* Start----Review attachment preview modal for the slider */}
            {isAttachmentModalOpen && activeAttachment && (
              <div
                className="reviewAttachmentDialogOverlay"
                role="presentation"
                onClick={closeAttachmentModal}
              >
                <div
                  className="reviewAttachmentDialog"
                  role="dialog"
                  aria-modal="true"
                  aria-label={data.reviewTitle}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="reviewAttachmentDialogClose"
                    aria-label="Close attachment preview"
                    onClick={closeAttachmentModal}
                  >
                    ×
                  </button>
                  <div className="reviewAttachmentDialogStage">
                    {renderAttachment(activeAttachment)}
                  </div>
                  <div className="reviewAttachmentDialogControls">
                    <button
                      type="button"
                      onClick={handlePreviousAttachment}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        background: "#202223",
                        color: "#ffffff",
                        border: "1px solid #202223",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 1px 0 rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <s-icon type="arrow-left" tone="" />
                      <span>Previous</span>
                    </button>
                    <div className="reviewAttachmentDialogThumbs">
                      {attachments.map((attachment, index) => (
                        <button
                          type="button"
                          key={`${data.id}-modal-thumb-${index}`}
                          ref={
                            activeAttachmentIndex === index
                              ? activeThumbRef
                              : null
                          }
                          className={`reviewAttachmentDialogThumb ${activeAttachmentIndex === index ? "is-active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveAttachmentIndex(index);
                          }}
                        >
                          {renderAttachment(attachment, true)}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleNextAttachment}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        background: "#202223",
                        color: "#ffffff",
                        border: "1px solid #202223",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 1px 0 rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <span>Next</span>
                      <s-icon type="arrow-right" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* End----Review attachment preview modal for the slider */}
          </>
        )}
        {/* End----Review attachments */}
        {/* Start----Review actions */}
        <s-grid
          gridTemplateColumns="auto auto"
          paddingBlockStart="small"
          justifyContent="space-between"
          alignItems="center"
          gap="base"
        >
          {/* Start----Review status */}
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-badge
              tone={
                data.status === "PENDING"
                  ? "caution"
                  : data.status === "PUBLISHED"
                    ? "success"
                    : "critical"
              }
            >
              {data.status}
            </s-badge>
            {countAttachments > 0 && (
              <s-badge tone="neutral" icon="image">
                {attachmentText(data.attachments)}
              </s-badge>
            )}
          </s-stack>
          {/* End----Review status */}
          {/* Start----Review action buttons */}
          <div
            style={{
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: "max-content",
              gap: "12px 8px",
            }}
          >
            <ActionButtons
              reviewId={data.id}
              reviewStatus={data.status}
              replied={replied}
              handleStatusUpdate={handleStatusUpdate}
              replyReview={replyReview}
              setReplyReview={setReplyReview}
            />
            <s-button
              tone="critical"
              icon="delete"
              onClick={() => handleReviewDelete(data.id, data?.attachments)}
            />
          </div>
          {/* End----Review action buttons */}
        </s-grid>
        {/* End----Review actions */}
      </s-stack>
    </>
  );
}

export function ActionButtons({
  reviewId,
  reviewStatus,
  replied,
  handleStatusUpdate,
  replyReview,
  setReplyReview,
}) {
  if (reviewStatus === "PENDING") {
    return (
      <>
        <s-button
          icon="check"
          onClick={() => handleStatusUpdate(reviewId, "PUBLISHED")}
        >
          Approve
        </s-button>
        <s-button
          tone="critical"
          icon="x"
          onClick={() => handleStatusUpdate(reviewId, "ARCHIVE")}
        >
          Reject
        </s-button>
      </>
    );
  } else if (reviewStatus === "PUBLISHED") {
    return (
      <>
        {replied ? (
          <s-button
            icon={replyReview ? "x" : "chat"}
            onClick={() => setReplyReview((pre) => !pre)}
          >
            {replyReview ? "Cancel" : "Edit reply"}
          </s-button>
        ) : (
          <s-button
            icon={replyReview ? "x" : "chat"}
            onClick={() => setReplyReview((pre) => !pre)}
          >
            {replyReview ? "Cancel" : "Reply"}
          </s-button>
        )}
        <s-button
          icon="arrow-down"
          onClick={() => handleStatusUpdate(reviewId, "ARCHIVE")}
        >
          Unpublish
        </s-button>
      </>
    );
  } else {
    return (
      <>
        <s-button
          icon="arrow-up"
          onClick={() => handleStatusUpdate(reviewId, "PUBLISHED")}
        >
          Re-Publish
        </s-button>
      </>
    );
  }
}
