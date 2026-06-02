import Text from "../../../components/essentials/elements/Text";
import CustomSection from "../../../components/essentials/CustomSection";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
export default function PublishingModeration() {
  return (
    <>
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
            heading="Automatic review requests"
            description="Send review request emails to customers after delivery"
          >
            <CustomSection>
              <s-choice-list>
                <s-choice value="a">
                  Auto-publish all reviews
                  <s-text slot="details">
                    Every submitted review goes live immediately — maximum
                    social proof, minimal friction.
                  </s-text>
                </s-choice>

                <s-choice value="b">
                  Auto-publish verified purchases only
                  <s-text slot="details">
                    Only reviews from confirmed buyers go live. Unverified
                    reviews are held for manual approval.
                  </s-text>
                </s-choice>
                <s-choice value="c">
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
                label="Hold 1–2 star reviews for approval"
                details="Gives you a chance to respond privately before they go live"
              />
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
              <s-stack gap="base">
                <s-switch
                  label="Content filters"
                  details="Automatically filter out unwanted content from submitted reviews"
                />
                <s-switch
                  label="Personal information filter"
                  details="Replace phone numbers and emails with *** automatically"
                />
                <s-switch
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
