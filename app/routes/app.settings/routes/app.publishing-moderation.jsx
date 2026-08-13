import Text from "../../../components/essentials/elements/Text";
import CustomSection from "../../../components/essentials/CustomSection";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
import { DEFAULT_PUBLISHING_MODERATION } from "../data/defaultData";
import { useState } from "react";
import { handleStateUpdate } from "../utils/client/utils.client";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../../../shopify.server";
import prisma from "../../../db.server";

import { adminErrorResponse } from "../../../utils/adminError.server";
import { useAdminFetcherToast } from "../../../utils/useAdminFetcherToast";
import SaveBar from "../../../components/essentials/SaveBar";
import { useSaveBarForm } from "../../../hooks/useSaveBarForm.js";
import { requireAdminContext } from "../../../services/adminContext.server.js";

export async function loader({ request }) {
  try {
    const { storeId: id } = await requireAdminContext(request);

    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeId: id,
      },
      include: {
        publishingModeration: true,
      },
    });
    console.log(storeSettings);

    return { storeSettings };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function action({ request }) {
  try {
    await authenticate.admin(request);

    const data = await request.json();
    await prisma.publishingModeration.update({
      where: {
        id: data.id,
      },
      data,
    });
    return {
      ok: true,
      message: "upserted PublishingModerationData",
    };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export default function PublishingModeration() {
  const { storeSettings } = useLoaderData();
  const fetcher = useFetcher();
  useAdminFetcherToast(fetcher);

  const [publishingModeration, setPublishingModeration] = useState(
    storeSettings.publishingModeration ?? DEFAULT_PUBLISHING_MODERATION,
  );

  const [formResetKey, setFormResetKey] = useState(0);

  const { handleSave, handleDiscard } = useSaveBarForm({
    value: publishingModeration,
    initialValue:
      storeSettings.publishingModeration ?? DEFAULT_PUBLISHING_MODERATION,
    fetcher,
    onSave: (value) =>
      fetcher.submit(value, { method: "POST", encType: "application/json" }),
    onDiscard: (savedValue) => {
      setPublishingModeration(savedValue);
      setFormResetKey((previous) => previous + 1);
    },
  });

  return (
    <>
      <SaveBar
        onSave={handleSave}
        onDiscard={handleDiscard}
        saving={fetcher.state !== "idle"}
      />
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
          <s-button  variant="secondary" onClick={() => window.open("http://qorix-review-docs.nextvence.com/pages/settings/publishing-moderation", "_blank")}>
         Need Help?
        </s-button>
      </s-stack>

      <s-section key={formResetKey}>
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
                <s-choice
                  value="AUTO_PUBLISH"
                  selected={
                    publishingModeration.autoPublishRules == "AUTO_PUBLISH"
                  }
                >
                  Auto-publish all reviews
                  <s-text slot="details">
                    Every submitted review goes live immediately — maximum
                    social proof, minimal friction.
                  </s-text>
                </s-choice>

                <s-choice
                  value="VERIFIED_ONLY"
                  selected={
                    publishingModeration.autoPublishRules == "VERIFIED_ONLY"
                  }
                >
                  Auto-publish verified purchases only
                  <s-text slot="details">
                    Only reviews from confirmed buyers go live. Unverified
                    reviews are hold for manual approval.
                  </s-text>
                </s-choice>
                <s-choice
                  value="MANUAL_PUBLISH"
                  selected={
                    publishingModeration.autoPublishRules == "MANUAL_PUBLISH"
                  }
                >
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
              </s-stack>
            </CustomSection>
          </CustomGridSection>
        </CustomSection>
      </s-section>
    </>
  );
}
