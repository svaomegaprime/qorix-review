import starFilled from "../../assets/images/star-filled.svg"
import starEmpty from "../../assets/images/star-empty.svg"
import '../../assets/css/swiper.css';
import { useEffect, useRef, useState } from "react";

export default function ReviewItem({
    data
}) {
    // Start----State for attachment modal
    const activeThumbRef = useRef(null);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [activeAttachmentIndex, setActiveAttachmentIndex] = useState(0);
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
    const replied = !!data.reply;
    const reply = data.reply;
    // End----State for review status

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

        setActiveAttachmentIndex((currentIndex) => (
            currentIndex === 0 ? countAttachments - 1 : currentIndex - 1
        ));
    };

    const handleNextAttachment = () => {
        if (countAttachments === 0) {
            return;
        }

        setActiveAttachmentIndex((currentIndex) => (
            currentIndex === countAttachments - 1 ? 0 : currentIndex + 1
        ));
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
        const mediaClassName = isThumbnail
            ? "reviewAttachmentMedia reviewAttachmentMediaThumbnail"
            : "reviewAttachmentMedia";

        if (attachment.type === "video") {
            return (
                <div className={mediaClassName}>
                    <video
                        controls={!isThumbnail}
                        autoPlay={false}
                        playsInline
                    >
                        <source src={attachment.url} type="video/mp4" />
                    </video>
                </div>
            );
        }

        return (
            <div className={mediaClassName}>
                <img src={attachment.url} alt="" draggable={false} />
            </div>
        );
    };
    // End----Handler for renderers attachments

    // Start----Handler for renderers attachment text
    const attachmentText = (attachments) => {
        const imageCount = attachments?.filter((attachment) => attachment.type === "image").length || 0;
        const videoCount = attachments?.filter((attachment) => attachment.type === "video").length || 0;

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
        <s-stack>
            {/* Start----Review header */}
            <s-stack direction="inline" gap="base" alignItems="center" justifyContent="space-between">
                <s-stack direction="inline" gap="small" alignItems="center">
                    <s-avatar size="medium" borderRadius="full" src={data.reviewerAvatar} />
                    <s-heading>{data.reviewerName}</s-heading>
                </s-stack>
                <s-text>{data.reviewDate}</s-text>
            </s-stack>
            {/* End----Review header */}
            {/* Start----Review rating */}
            <s-grid gridTemplateColumns="repeat(5, 20px)" alignItems="center" paddingBlockStart="small">
                {[...Array(data.rating)].map((_, index) => (
                    <s-image key={index} src={starFilled} inlineSize="fill" />
                ))}
                {[...Array(5 - data.rating)].map((_, index) => (
                    <s-image key={index} src={starEmpty} inlineSize="fill" />
                ))}
            </s-grid>
            {/* End----Review rating */}
            {/* Start----Review content */}
            <div style={{ display: 'grid', gap: '4px', paddingTop: '7px' }}>
                {/* Start----Review title */}
                <s-heading>
                    {data.reviewTitle}
                </s-heading>
                {/* End----Review title */}
                {/* Start----Review description */}
                <s-paragraph color="subdued">
                    {data.reviewDescription}
                </s-paragraph>
                {/* End----Review description */}
                {/* Start----Review reply */}
                {replied && (
                    <div style={{
                        paddingLeft: "12px",
                        position: "relative",
                        margin: "4px 0",
                        display: "grid",
                        gap: "4px",
                    }}>
                        <div style={{
                            position: "absolute",
                            left: "0",
                            top: "0",
                            width: "2px",
                            height: "100%",
                            backgroundColor: "rgba(0, 191, 122, 1)",
                        }} />
                        <s-heading>
                            Your reply
                        </s-heading>
                        <s-paragraph color="subdued">
                            {reply}
                        </s-paragraph>
                    </div>
                )}
                {/* End----Review reply */}
            </div>
            {/* End----Review content */}
            {/* Start----Review attachments */}
            {countAttachments > 0 && (
                <>
                    {/* Start----Review attachment preview item */}
                    <s-grid gridTemplateColumns="repeat(auto-fit, minmax(55px, 55px))" gap="base" paddingBlockStart="small">
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
                                        <span>
                                            +{countAttachments - 5}
                                        </span>
                                    ) : (
                                        attachment.type === "video" && (
                                            <img src="/reviews/play.png" width="20" height="20" alt="" />
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
                                    <s-button onClick={handlePreviousAttachment} variant="primary">
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", width: "75px", justifyContent: "center" }}>
                                            <s-icon type="arrow-left" />
                                            Previous
                                        </div>
                                    </s-button>
                                    <div className="reviewAttachmentDialogThumbs">
                                        {attachments.map((attachment, index) => (
                                            <button
                                                type="button"
                                                key={`${data.id}-modal-thumb-${index}`}
                                                ref={activeAttachmentIndex === index ? activeThumbRef : null}
                                                className={`reviewAttachmentDialogThumb ${activeAttachmentIndex === index ? "is-active" : ""}`}
                                                onClick={() => setActiveAttachmentIndex(index)}
                                            >
                                                {renderAttachment(attachment, true)}
                                            </button>
                                        ))}
                                    </div>
                                    <s-button onClick={handleNextAttachment} variant="primary">
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", width: "70px", justifyContent: "center" }}>
                                            Next
                                            <s-icon type="arrow-right" />
                                        </div>
                                    </s-button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* End----Review attachment preview modal for the slider */}
                </>
            )}
            {/* End----Review attachments */}
            {/* Start----Review actions */}
            <s-grid gridTemplateColumns="auto auto" paddingBlockStart="small" justifyContent="space-between" alignItems="center" gap="base">
                {/* Start----Review status */}
                <s-stack direction="inline" gap="small" alignItems="center">
                    <s-badge tone={
                        data.reviewStatus === "Pending" ? "caution" : data.reviewStatus === "Published" ? "success" : "critical"
                    }>{data.reviewStatus}</s-badge>
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
                    <ActionButtons reviewStatus={data.reviewStatus} replied={replied} />
                    <s-button icon="delete" />
                </div>
                {/* End----Review action buttons */}
            </s-grid>
            {/* End----Review actions */}
        </s-stack>
    )
}

export function ActionButtons({ reviewStatus, replied }) {
    if (reviewStatus === "Pending") {
        return (
            <>
                <s-button icon="check">Approve</s-button>
                <s-button icon="x">Reject</s-button>
            </>
        )
    } else if (reviewStatus === "Published") {
        return (
            <>
                {replied ? (
                    <s-button icon="edit">Edit reply</s-button>
                ) : (
                    <s-button icon="chat">Reply</s-button>
                )}
                <s-button icon="arrow-down">Unpublish</s-button>
            </>
        )
    } else {
        return (
            <>
                <s-button icon="arrow-up">Republish</s-button>
            </>
        )
    }
}
