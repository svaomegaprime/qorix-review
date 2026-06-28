import { useFetcher, useLoaderData } from "react-router";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
import CustomSection from "../../../components/essentials/CustomSection";
import Text from "../../../components/essentials/elements/Text";
import { useEffect, useState } from "react";
import { DEFAULT_REQUEST_SCHEDULING } from "../data/defaultData";
import { getStoreData } from "../../../utils/getStoreData";
import { authenticate } from "../../../shopify.server";
import prisma from "../../../db.server";

export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { id } = await getStoreData(admin);

    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeId: id,
      },
      include: {
        requestScheduling: true,
      },
    });
    console.log(storeSettings);

    return { storeSettings };
  } catch (error) {
    console.log(error);

    return {};
  }
}

export async function action({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);

    const data = await request.json();
    // const { id } = await getStoreData(admin);

    const requestSchedulingData = await prisma.requestScheduling.update({
      where: {
        id: data.id,
      },
      data,
    });

    console.log(
      "[store settings]: requestSchedulingData data",
      requestSchedulingData,
    );

    // console.log("[store settings:]requestScheduling", res);

    return {
      ok: true,
      message: "upserted RequestSchedulingData",
    };
  } catch (error) {
    console.log(error);
  }
}

export default function Settings() {
  const { storeSettings } = useLoaderData();
  const fetcher = useFetcher();

  const [requestScheduling, setRequestScheduling] = useState(
    storeSettings?.requestScheduling ?? DEFAULT_REQUEST_SCHEDULING,
  );
  const [showCustomFields, setShowCustomFields] = useState({
    customDeliveryDays: false,
    customDelayDays: false,
    customMinimumOrderValue: false,
  });
  useEffect(() => {
    const hasChanged =
      JSON.stringify(requestScheduling) !==
      JSON.stringify(storeSettings?.requestScheduling);

    if (hasChanged) {
      shopify.saveBar.show("leave-confirm-save-bar");
    } else {
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [requestScheduling]);

  console.log("DEFAULT_REQUEST_SCHEDULING:", requestScheduling);

  function handleSave() {
    fetcher.submit(requestScheduling, {
      method: "post",
      encType: "application/json",
    });
  }

  console.log("loading:", fetcher.state);
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      console.log("Response:", fetcher.data);

      // Save successful
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [fetcher.state, fetcher.data]);
  function handleDiscard() {}

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
          <Text>Request reviews</Text>
          <s-text>
            Send review request emails to customers after delivery
          </s-text>
        </s-box>
        <s-button inline="fill" variant="secondary">
          View review requests
        </s-button>
      </s-stack>

      <s-section>
        {/* <s-stack padding="base" border="base" borderRadius="base">
                </s-stack> */}
        <CustomSection padding="0">
          <CustomGridSection
            heading="Automatic review requests"
            description="Send review request emails to customers after delivery"
          >
            <CustomSection>
              <s-grid gap="small">
                <s-switch
                  defaultChecked={requestScheduling.isAutomaticRequest}
                  onChange={(e) =>
                    setRequestScheduling((pre) => ({
                      ...pre,
                      isAutomaticRequest: e.target.checked,
                    }))
                  }
                  label="Enable automatic requests"
                  details="Customers receive a review request email automatically after their order is delivered"
                ></s-switch>

                <s-divider />
                <s-stack>
                  <s-heading>Send request</s-heading>
                  <s-paragraph color="subdued">
                    Days after the order is marked as delivered
                  </s-paragraph>
                  <s-box paddingBlock="small">
                    <s-select
                      value={String(requestScheduling.sendRequestAfterDelivery)}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        const isCustom = value === "custom";
                        setRequestScheduling((pre) => ({
                          ...pre,
                          sendRequestAfterDelivery: isCustom
                            ? 5
                            : Number(value),
                        }));
                        isCustom
                          ? setShowCustomFields((pre) => ({
                              ...pre,
                              customDeliveryDays: true,
                            }))
                          : setShowCustomFields((pre) => ({
                              ...pre,
                              customDeliveryDays: false,
                            }));
                      }}
                    >
                      <s-option value="5">5 days after delivery</s-option>
                      <s-option value="7">7 days after delivery</s-option>
                      <s-option value="15">15 days after delivery</s-option>
                      <s-option value="custom">Add custom days</s-option>
                    </s-select>
                  </s-box>
                  {showCustomFields.customDeliveryDays && (
                    <s-number-field
                      inputMode="numeric"
                      step={1}
                      min={0}
                      label="Custom days"
                      defaultValue={requestScheduling.sendRequestAfterDelivery}
                      onInput={(e) =>
                        setRequestScheduling((pre) => ({
                          ...pre,
                          sendRequestAfterDelivery: Number(e.target.value),
                        }))
                      }
                    />
                  )}
                </s-stack>
                <s-divider />

                <s-stack>
                  <s-switch
                    defaultChecked={requestScheduling.isReminderRequest}
                    onChange={(e) =>
                      setRequestScheduling((pre) => ({
                        ...pre,
                        isReminderRequest: e.target.checked,
                      }))
                    }
                    label="Send reminder if no response"
                    details="Follow-up email if customer hasn't reviewed after the first request"
                  ></s-switch>
                </s-stack>
                <s-divider />

                <s-stack>
                  <s-heading>Reminder delay</s-heading>
                  <s-paragraph color="subdued">
                    Days after first request to send the reminder
                  </s-paragraph>
                  <s-box paddingBlock="small">
                    <s-select
                      value={String(requestScheduling.reminderRequestDelay)}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        const isCustom = value === "custom";
                        setRequestScheduling((pre) => ({
                          ...pre,
                          reminderRequestDelay: isCustom ? 5 : Number(value),
                        }));
                        isCustom
                          ? setShowCustomFields((pre) => ({
                              ...pre,
                              customDelayDays: true,
                            }))
                          : setShowCustomFields((pre) => ({
                              ...pre,
                              customDelayDays: false,
                            }));
                      }}
                    >
                      <s-option value="5">5 days later</s-option>
                      <s-option value="7">7 days later</s-option>
                      <s-option value="10">10 days later</s-option>
                      <s-option value="15">15 days later</s-option>
                      <s-option value="custom">Add custom days</s-option>
                    </s-select>
                  </s-box>
                  {showCustomFields.customDelayDays && (
                    <s-number-field
                      inputMode="numeric"
                      step={1}
                      min={0}
                      label="Custom days"
                      defaultValue={requestScheduling.reminderRequestDelay}
                      onInput={(e) =>
                        setRequestScheduling((pre) => ({
                          ...pre,
                          reminderRequestDelay: Number(e.target.value),
                        }))
                      }
                    />
                  )}
                </s-stack>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base large base none">
            <s-divider />
          </s-stack>

          <CustomGridSection
            heading="Request exclusions"
            description="Orders that should never receive a review request."
          >
            <CustomSection>
              <s-grid gap="small">
                <s-switch
                  defaultChecked={requestScheduling.isSkipRefundedOrder}
                  onChange={(e) =>
                    setRequestScheduling((pre) => ({
                      ...pre,
                      isSkipRefundedOrder: e.target.checked,
                    }))
                  }
                  label="Skip refunded orders"
                  details="Don't send requests for orders that were fully refunded"
                ></s-switch>
                <s-switch
                  defaultChecked={requestScheduling.isSkipCancelledOrder}
                  onChange={(e) =>
                    setRequestScheduling((pre) => ({
                      ...pre,
                      isSkipCancelledOrder: e.target.checked,
                    }))
                  }
                  label="Skip cancelled orders"
                  details="Don't send requests for orders that were cancelled"
                ></s-switch>
                <CustomSection>
                  <s-grid gridTemplateColumns="1fr 120px" gap="small none">
                    <s-box>
                      <s-heading>Minimum order value</s-heading>
                      <s-paragraph color="subdued">
                        Only send requests for orders above this amount (0 = all
                        orders)
                      </s-paragraph>
                    </s-box>
                    <s-select
                      value={String(requestScheduling.minimumOrderValue)}
                      onChange={(e) => {
                        const isCustom = e.target.value === "CUSTOM";
                        if (isCustom) {
                          setShowCustomFields((pre) => ({
                            ...pre,
                            customMinimumOrderValue: true,
                          }));
                        } else {
                          setRequestScheduling((pre) => ({
                            ...pre,
                            minimumOrderValue: Number(e.target.value),
                          }));
                          setShowCustomFields((pre) => ({
                            ...pre,
                            customMinimumOrderValue: false,
                          }));
                        }
                      }}
                    >
                      <s-option value="0">0 USD</s-option>
                      <s-option value="100">100 USD</s-option>
                      <s-option value="500">500 USD</s-option>
                      <s-option value="1000">1000 USD</s-option>
                      <s-option value="CUSTOM">Custom Value</s-option>
                    </s-select>

                    {showCustomFields.customMinimumOrderValue && (
                      <s-grid-item gridColumn="span 2">
                        <s-number-field
                          defaultValue={requestScheduling.minimumOrderValue}
                          onInput={(e) =>
                            setRequestScheduling((pre) => ({
                              ...pre,
                              minimumOrderValue: Number(e.target.value),
                            }))
                          }
                        />
                      </s-grid-item>
                    )}
                  </s-grid>
                </CustomSection>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
        </CustomSection>
      </s-section>
    </>
  );
}
