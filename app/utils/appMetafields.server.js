const APP_METAFIELD_NAMESPACE = "qorix_review";

const APP_METAFIELDS_QUERY = `#graphql
  query AppMetafields($namespace: String!, $first: Int!) {
    currentAppInstallation {
      id
      metafields(namespace: $namespace, first: $first) {
        edges {
          node {
            key
            value
          }
        }
      }
    }
  }
`;

const METAFIELDS_SET_MUTATION = `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
        namespace
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const DEBUG_PREFIX = "[qorix-review][app-metafields]";

function safeParseJson(value) {
  if (typeof value !== "string") {
    return value ?? null;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return value;
  }
}

export async function getAppInstallationMetafields(
  admin,
  namespace = APP_METAFIELD_NAMESPACE,
) {
  const response = await admin.graphql(APP_METAFIELDS_QUERY, {
    variables: {
      namespace,
      first: 10,
    },
  });

  const json = await response.json();
  const currentAppInstallation = json?.data?.currentAppInstallation;

  console.log(DEBUG_PREFIX, "query response", json);

  if (!currentAppInstallation?.id) {
    throw new Error("Unable to resolve current app installation id");
  }

  const metafieldMap = {};

  for (const { node } of currentAppInstallation.metafields?.edges ?? []) {
    metafieldMap[node.key] = safeParseJson(node.value);
  }

  return {
    currentAppInstallationId: currentAppInstallation.id,
    metafieldMap,
    rawResponse: json,
  };
}

export async function setAppMetafield(
  admin,
  key,
  value,
  namespace = APP_METAFIELD_NAMESPACE,
) {
  const { currentAppInstallationId } = await getAppInstallationMetafields(
    admin,
    namespace,
  );

  const metafieldsToSet = [
    {
      ownerId: currentAppInstallationId,
      namespace,
      key,
      type: "json",
      value: JSON.stringify(value),
    },
  ];

  console.log(DEBUG_PREFIX, "metafieldsSet payload", metafieldsToSet);

  const response = await admin.graphql(METAFIELDS_SET_MUTATION, {
    variables: {
      metafields: metafieldsToSet,
    },
  });

  const json = await response.json();
  const userErrors = json?.data?.metafieldsSet?.userErrors ?? [];

  console.log(DEBUG_PREFIX, "metafieldsSet response", json);

  if (userErrors.length > 0) {
    console.error(DEBUG_PREFIX, "metafieldsSet userErrors", userErrors);
  }

  return json;
}
