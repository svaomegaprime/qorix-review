import { useEffect, useState } from "react";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
import CustomSection from "../../../components/essentials/CustomSection";
import Text from "../../../components/essentials/elements/Text";
import { DEFAULT_ADMIN_NOTIFICATION } from "../data/defaultData";
import { handleStateUpdate } from "../utils/client/utils.client";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../../../shopify.server";
import prisma from "../../../db.server";

import { getStoreData } from "../../../utils/getStoreData";
import { adminErrorResponse } from "../../../utils/adminError.server";
import { useAdminFetcherToast } from "../../../utils/useAdminFetcherToast";

export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { id } = await getStoreData(admin);

    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeId: id,
      },
      include: {
        adminNotification: true,
      },
    });

    return { storeSettings };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function action({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);

    const data = await request.json();
    // const { id } = await getStoreData(admin);

    const adminNotificationData = await prisma.adminNotification.update({
      where: {
        id: data.id,
      },
      data,
    });

    return {
      ok: true,
      message: "upserted AdminNotificationData",
    };
  } catch (error) {
    return adminErrorResponse(error);
  }
}
export default function AdminNotification() {
  const { storeSettings } = useLoaderData();
  const fetcher = useFetcher();
  useAdminFetcherToast(fetcher);

  const [adminNotification, setAdminNotification] = useState(
    storeSettings.adminNotification ?? DEFAULT_ADMIN_NOTIFICATION,
  );
  const [countMail, setCountMail] = useState(
    Object.entries(adminNotification.notificationEmailAddress).filter(
      (item) => item[1] !== null,
    ).length,
  );
  const maxNumberOfEmail = 3;

  const handleEmails = (i, value) => {
    const itemName = `email${i}`;
    handleStateUpdate(setAdminNotification, "notificationEmailAddress", {
      ...adminNotification.notificationEmailAddress,
      [itemName]: value,
    });
  };

  const handleAddButton = () => {
    if (countMail < maxNumberOfEmail) {
      const newKey = `email${countMail + 1}`;
      const newField = (adminNotification.notificationEmailAddress[newKey] =
        "");
      handleStateUpdate(setAdminNotification, "notificationEmailAddress", {
        ...adminNotification.notificationEmailAddress,
        [newKey]: newField,
      });
      setCountMail(
        Object.entries(adminNotification.notificationEmailAddress).filter(
          (item) => item[1] !== null,
        ).length,
      );
    } else {
      shopify.toast.show("Maximum email added.");
    }
  };

  useEffect(() => {
    const hasChanged =
      JSON.stringify(adminNotification) !==
      JSON.stringify(storeSettings?.adminNotification);

    if (hasChanged) {
      shopify.saveBar.show("leave-confirm-save-bar");
    } else {
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [adminNotification]);

  function handleSave() {
    fetcher.submit(adminNotification, {
      method: "POST",
      encType: "application/json",
    });
  }

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [fetcher.state, fetcher.data]);

  const [formResetKey, setFormResetKey] = useState(0);

  function handleDiscard() {
    setAdminNotification(
      storeSettings.adminNotification ?? DEFAULT_ADMIN_NOTIFICATION,
    );
    setFormResetKey((pre) => pre + 1);
    shopify.saveBar.hide("leave-confirm-save-bar");
  }

  return (
    <>
      <ui-save-bar id="leave-confirm-save-bar">
        <button onClick={handleSave} variant="primary" id="save-button">
          Save
        </button>
        <button onClick={handleDiscard} id="discard-button">
          Discard
        </button>
      </ui-save-bar>
      <s-stack
        paddingBlockEnd="base"
        direction="inline"
        alignItems="center"
        justifyContent="space-between"
      >
        <s-box>
          <Text>Admin notifications</Text>
          <s-text>
            Choose when Qorix sends you an email about review activity
          </s-text>
        </s-box>
      </s-stack>

      <s-section key={formResetKey}>
        {/* <s-stack padding="base" border="base" borderRadius="base">
                  </s-stack> */}
        <CustomSection padding="0">
          <CustomGridSection
            heading="Notification email address"
            description="All admin notifications are sent to this email"
          >
            <CustomSection>
              <s-grid gap="small">
                <s-heading>Email address</s-heading>
                {new Array(countMail).fill(null).map((_, i) => {
                  const key = `email${i + 1}`;
                  return (
                    <>
                      <s-text-field
                        key={i}
                        defaultValue={
                          adminNotification.notificationEmailAddress[key]
                        }
                        details="This is your store's admin email. You can change it at any time."
                        onInput={(e) => handleEmails(i + 1, e.target.value)}
                      />
                    </>
                  );
                })}
                {/* <s-text-field defaultValue="svaomegaprime@gmail.com" />
                <s-text-field defaultValue="svaomegaprime@gmail.com" /> */}
                <s-divider />
                <s-button
                  onClick={() => handleAddButton()}
                  icon="email"
                  variant="secondary"
                >
                  Add email (max 3)
                </s-button>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base large base none">
            <s-divider />
          </s-stack>
          <CustomGridSection
            heading="Notification events"
            description="Select which events trigger an email notification to you"
          >
            <CustomSection>
              <s-grid gap="small">
                <s-switch
                  defaultChecked={adminNotification.isNewReviewNotify}
                  onChange={(e) =>
                    handleStateUpdate(
                      setAdminNotification,
                      "isNewReviewNotify",
                      e.target.checked,
                    )
                  }
                  label="New review received"
                  details="Notify when any customer submits a review"
                />
                <s-switch
                  defaultChecked={adminNotification.isReviewApprovalNotify}
                  onChange={(e) =>
                    handleStateUpdate(
                      setAdminNotification,
                      "isReviewApprovalNotify",
                      e.target.checked,
                    )
                  }
                  label="Review needs moderation"
                  details="Notify when a review is held for your approval"
                />
                <s-switch
                  defaultChecked={adminNotification.isLowStarReviewNotify}
                  onChange={(e) =>
                    handleStateUpdate(
                      setAdminNotification,
                      "isLowStarReviewNotify",
                      e.target.checked,
                    )
                  }
                  label="Low star review alert"
                  details="Notify when a 1 or 2 star review is received"
                />
                {/* <s-switch
                  defaultChecked={adminNotification.isWeeklySummaryNotify}
                  onChange={(e) =>
                    handleStateUpdate(
                      setAdminNotification,
                      "isWeeklySummaryNotify",
                      e.target.checked,
                    )
                  }
                  label="Weekly summary"
                  details="Get a weekly digest of reviews, requests and ratings"
                /> */}
              </s-grid>
            </CustomSection>
          </CustomGridSection>
          {/* <s-stack padding="base large base none">
            <s-divider />
          </s-stack>
          <CustomGridSection
            heading="Notification frequency"
            description="Control how often you receive new review notifications"
          >
            <CustomSection>
              <s-grid gap="small">
                <s-heading>New review notification</s-heading>

                <s-select
                  onChange={(e) =>
                    handleStateUpdate(
                      setAdminNotification,
                      "notificationFrequency",
                      e.target.value,
                    )
                  }
                  details="Immediate alerts are best if you moderate reviews manually"
                >
                  <s-option value="IMMEDIATELY">Send immediately</s-option>
                  <s-option value="DAILY">Daily digest</s-option>
                  <s-option value="WEEKLY">Weekly digest </s-option>
                </s-select>
              </s-grid>
            </CustomSection>
          </CustomGridSection> */}
        </CustomSection>
      </s-section>
    </>
  );
}
