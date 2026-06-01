import TEMP_REVIEWS from "../data/reviews.json";
import Loader from "../../../components/essentials/Loader";
import Text from "../../../components/essentials/elements/Text";
import { useLoaderData, useNavigation } from "react-router";

export async function loader() {
  return {
    reviews: TEMP_REVIEWS,
  };
}

export default function Reviews() {
  // Start----Default CSR loading state checking for navigation
  const loading = useNavigation().state === "loading";
  if (loading) {
    return <Loader />;
  }
  // End----Default CSR loading state checking for navigation
  
  // Start----Accessing loaded data using useLoaderData
  const { reviews } = useLoaderData();
  // End----Accessing loaded data using useLoaderData

  // Start----Debugging loaded data
  console.clear();
  console.log("Reviews data loaded:", reviews);
  // End----Debugging loaded data

  return (
    <s-page>
      {/* Start----Page Header */}
      <s-grid gridTemplateColumns="auto 1fr" alignItems="center" gap="base" paddingBlock="small large">
        <s-stack direction="inline" alignItems="center" gap="small">
          <Text as="h2">Reviews</Text>
          <s-badge tone="success" color="strong">Auto-Publish: On</s-badge>
        </s-stack>
        <s-grid gridTemplateColumns="auto auto auto" gap="small" justifyContent="end">
          <s-button icon="download">Import</s-button>
          <s-button icon="upload">Export</s-button>
          <s-button icon="plus">Request reviews</s-button>
        </s-grid>
      </s-grid>
      {/* End----Page Header */}
    </s-page>
  );
}
