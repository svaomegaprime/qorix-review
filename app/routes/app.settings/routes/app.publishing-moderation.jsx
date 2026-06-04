import Text from "../../../components/essentials/elements/Text";
import CustomSection from "../../../components/essentials/CustomSection";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
import { DEFAULT_PUBLISHING_MODERATION } from "../data/defaultData";
import { useState } from "react";
import { handleStateUpdate } from "../utils/client/utils.client";
export default function PublishingModeration() {
  const [publishingModeration, setPublishingModeration] = useState(
    DEFAULT_PUBLISHING_MODERATION,
  );

  return (
    <>
      {/* <pre>{JSON.stringify(publishingModeration, null, 2)}</pre> */}

      <s-stack
        paddingBlockEnd="base"
        direction="inline"
        alignItems="center"
        justifyContent="space-between"
      >
        <s-box>
          <Text>Publishing & moderation</Text>
          <s-paragraph>
            Control which reviews go live and how content is filtered
          </s-paragraph>
        </s-box>
      </s-stack>

      <s-section>
        <CustomSection padding="0">
          <CustomGridSection
            heading="Auto-publish rules"
            description="Choose which reviews are published automatically without manual approval"
          >
            <CustomSection>
              <s-choice-list
                onChange={(e) =>
                  handleStateUpdate(
                    setPublishingModeration,
                    "autoPublishRules",
                    e.target.values[0],
                  )
                }
              >
                <s-choice value="AUTO_PUBLISH" selected>
                  Auto-publish all reviews
                  <s-text slot="details">
                    Every submitted review goes live immediately — maximum
                    social proof, minimal friction.
                  </s-text>
                </s-choice>

                <s-choice value="VERIFIED_ONLY">
                  Auto-publish verified purchases only
                  <s-text slot="details">
                    Only reviews from confirmed buyers go live. Unverified
                    reviews are held for manual approval.
                  </s-text>
                </s-choice>
                <s-choice value="MANUAL_PUBLISH">
                  Manual approval for all reviews
                  <s-text slot="details">
                    Every review requires your approval before it appears on
                    your store.
                  </s-text>
                </s-choice>
              </s-choice-list>
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base large base none">
            <s-divider />
          </s-stack>
          <CustomGridSection
            heading="Low-rating hold"
            description="Automatically hold low-star reviews for manual review before publishing"
          >
            <CustomSection>
              <s-switch
                defaultChecked={publishingModeration.isLowRatingHold}
                onChange={(e) =>
                  handleStateUpdate(
                    setPublishingModeration,
                    "isLowRatingHold",
                    e.target.checked,
                  )
                }
                label="Hold 1–2 star reviews for approval"
                details="Gives you a chance to respond privately before they go live"
              />
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base large base none">
            <s-divider />
          </s-stack>
          <CustomGridSection
            heading="Content filters"
            description="Automatically filter out unwanted content from submitted reviews"
          >
            <CustomSection>
              <s-stack gap="base">
                <s-switch
                  defaultChecked={publishingModeration.isProfanityFilter}
                  onChange={(e) =>
                    handleStateUpdate(
                      setPublishingModeration,
                      "isProfanityFilter",
                      e.target.checked,
                    )
                  }
                  label="Profanity filter"
                  details="Block or flag reviews containing profanity words and phrases"
                />
                <s-switch
                  defaultChecked={publishingModeration.isPersonalInfoFilter}
                  onChange={(e) =>
                    handleStateUpdate(
                      setPublishingModeration,
                      "isPersonalInfoFilter",
                      e.target.checked,
                    )
                  }
                  label="Personal information filter"
                  details="Replace phone numbers and emails with *** automatically"
                />
                <s-switch
                  defaultChecked={publishingModeration.isSpamFilter}
                  onChange={(e) =>
                    handleStateUpdate(
                      setPublishingModeration,
                      "isSpamFilter",
                      e.target.checked,
                    )
                  }
                  label="Spam filter"
                  details="Automatically flag suspected spam reviews for manual review"
                />
              </s-stack>
            </CustomSection>
          </CustomGridSection>
        </CustomSection>
      </s-section>
    </>
  );
}
