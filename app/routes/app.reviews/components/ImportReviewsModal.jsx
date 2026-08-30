/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useCallback } from "react";

const VALID_STATUSES = ["PENDING", "PUBLISHED", "REJECTED", "SPAM", "ARCHIVE"];
const VALID_SOURCES = ["DEMO", "REQUEST_EMAIL", "PRODUCT_PAGE"];

const COLUMN_ALIASES = {
  productTitle: ["producttitle", "product_title", "title_product"],
  productHandle: ["producthandle", "product_handle", "handle"],
  productId: ["productid", "product_id", "product_gid"],
  reviewerName: [
    "reviewername",
    "reviewer_name",
    "author",
    "name",
    "customer_name",
  ],
  reviewerEmail: ["revieweremail", "reviewer_email", "email", "customer_email"],
  reviewerPhone: ["reviewerphone", "reviewer_phone", "phone"],
  rating: ["rating", "stars", "score"],
  title: ["title", "review_title", "headline", "subject"],
  body: ["body", "review_body", "content", "review", "comment", "feedback"],
  status: ["status", "state", "review_status"],
  source: ["source", "review_source"],
  isVerified: ["isverified", "is_verified", "verified", "verified_buyer"],
  attachmentUrls: [
    "attachmenturls",
    "attachment_urls",
    "attachments",
    "images",
    "image_urls",
    "imageurls",
    "photos",
    "media",
  ],
  reply: ["reply", "store_reply", "reply_body", "admin_reply", "response"],
  createdAt: ["createdat", "created_at", "date", "review_date", "timestamp"],
};

function parseCsvText(text) {
  const rows = [];
  let current = "";
  let inQuotes = false;
  let row = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(current);
      current = "";
    } else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
      row.push(current);
      current = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      if (ch === "\r") i++;
    } else {
      current += ch;
    }
  }
  row.push(current);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

function resolveColumnIndices(headerRow) {
  const colIndex = {};
  const normalized = headerRow.map((h) =>
    h
      .trim()
      .toLowerCase()
      .replace(/[\s-_]/g, ""),
  );

  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    const allNames = [
      key.toLowerCase(),
      ...aliases.map((a) => a.toLowerCase().replace(/[\s-_]/g, "")),
    ];
    const idx = normalized.findIndex((h) => allNames.includes(h));
    if (idx !== -1) {
      colIndex[key] = idx;
    }
  }

  return colIndex;
}

function validateImportRows(headerRow, dataRows) {
  const errors = [];
  const colIndex = resolveColumnIndices(headerRow);

  // Check if minimum necessary column (rating) is present
  if (colIndex.rating === undefined) {
    errors.push('Missing required column: "rating" (or "stars")');
    return { errors, validRows: [] };
  }

  const validRows = [];
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2;
    const get = (col) => {
      const idx = colIndex[col];
      return idx !== undefined && idx < row.length
        ? (row[idx] || "").trim()
        : "";
    };

    const rating = parseInt(get("rating"), 10);
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      errors.push(
        `Row ${rowNum}: rating must be a number from 1 to 5 (got "${get("rating")}")`,
      );
      continue;
    }

    let status = get("status").toUpperCase();
    if (status && !VALID_STATUSES.includes(status)) {
      status = "PENDING";
    }
    if (!status) {
      status = "PENDING";
    }

    let source = get("source").toUpperCase();
    if (source && !VALID_SOURCES.includes(source)) {
      source = "PRODUCT_PAGE";
    }
    if (!source) {
      source = "PRODUCT_PAGE";
    }

    const rawVerified = get("isVerified").toLowerCase();
    const isVerified =
      rawVerified === "yes" ||
      rawVerified === "true" ||
      rawVerified === "1" ||
      rawVerified === "verified";

    const createdAt = get("createdAt");
    let validCreatedAt = null;
    if (createdAt) {
      const parsedDate = new Date(createdAt);
      if (!Number.isNaN(parsedDate.getTime())) {
        validCreatedAt = parsedDate.toISOString();
      }
    }

    // Parse image/video attachment URLs
    const rawAttachmentUrls = get("attachmentUrls");
    let attachmentUrls = [];
    if (rawAttachmentUrls) {
      attachmentUrls = rawAttachmentUrls
        .split(/[|,;]/)
        .map((u) => u.trim())
        .filter(
          (u) =>
            Boolean(u) &&
            (u.startsWith("http://") ||
              u.startsWith("https://") ||
              u.startsWith("/")),
        );
    }

    validRows.push({
      productTitle: get("productTitle") || null,
      productHandle: get("productHandle") || null,
      productId: get("productId") || null,
      reviewerName: get("reviewerName") || null,
      reviewerEmail: get("reviewerEmail") || null,
      reviewerPhone: get("reviewerPhone") || null,
      rating,
      title: get("title") || null,
      body: get("body") || null,
      status,
      source,
      isVerified,
      attachmentUrls,
      reply: get("reply") || null,
      createdAt: validCreatedAt,
    });
  }

  return { errors, validRows };
}

/**
 * @param {{ fetcher: import("react-router").FetcherWithComponents<any> }} props
 */
export default function ImportReviewsModal({ fetcher }) {
  const [importErrors, setImportErrors] = useState([]);
  const [importPreview, setImportPreview] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const importFileRef = useRef(null);

  const handleDownloadExampleCsv = useCallback(() => {
    const exampleHeaders = [
      "productTitle",
      "productHandle",
      "productId",
      "reviewerName",
      "reviewerEmail",
      "reviewerPhone",
      "rating",
      "title",
      "body",
      "status",
      "source",
      "isVerified",
      "attachmentUrls",
      "reply",
      "createdAt",
    ];

    const exampleRows = [
      exampleHeaders.join(","),
      [
        '"Gift Card"',
        '"gift-card"',
        '"gid://shopify/Product/123"',
        '"John Doe"',
        '"john@example.com"',
        '"01700000000"',
        "5",
        '"Great product"',
        '"I love this product, top notch quality!"',
        '"PUBLISHED"',
        '"PRODUCT_PAGE"',
        '"Yes"',
        '"https://images.unsplash.com/photo-1523275335684-37898b6baf30 | https://images.unsplash.com/photo-1505740420928-5e560c06d30e"',
        '"Thank you for your wonderful feedback!"',
        `"${new Date().toISOString()}"`,
      ].join(","),
      [
        '"The Collection Snowboard"',
        '"the-collection-snowboard"',
        '"gid://shopify/Product/456"',
        '"Jane Smith"',
        '"jane@example.com"',
        '""',
        "4",
        '"Awesome quality"',
        '"Fast shipping and high quality build."',
        '"PUBLISHED"',
        '"PRODUCT_PAGE"',
        '"No"',
        '""',
        '""',
        `"${new Date().toISOString()}"`,
      ].join(","),
    ];

    const csvContent = exampleRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "example-import.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleImportFileChange = useCallback((e) => {
    let files = null;
    if (e.target?.files && e.target.files.length > 0) {
      files = e.target.files;
    } else if (e.detail?.files && e.detail.files.length > 0) {
      files = e.detail.files;
    } else if (e.target?.value) {
      files = e.target.value;
    } else if (e.detail?.value) {
      files = e.detail.value;
    }

    setImportErrors([]);
    setImportPreview(null);

    if (!files) {
      return;
    }

    const fileList =
      files instanceof FileList || Array.isArray(files) ? files : [files];
    const file = fileList[0];

    if (!file || !(file instanceof File)) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setImportErrors(["Only CSV files (.csv) are accepted."]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text !== "string") {
        setImportErrors(["Failed to read file."]);
        return;
      }
      const parsed = parseCsvText(text);
      if (parsed.length < 2) {
        setImportErrors([
          "CSV must have a header row and at least one data row.",
        ]);
        return;
      }
      const [headerRow, ...dataRows] = parsed;
      const { errors, validRows } = validateImportRows(headerRow, dataRows);
      if (errors.length > 0) {
        setImportErrors(errors);
      }
      if (validRows.length > 0) {
        setImportPreview(validRows);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleImportSubmit = useCallback(() => {
    if (!importPreview || importPreview.length === 0) return;
    setIsImporting(true);
    fetcher.submit(
      {
        actionType: "IMPORT_REVIEWS",
        csvData: JSON.stringify(importPreview),
      },
      { method: "POST" },
    );
  }, [importPreview, fetcher]);

  useEffect(() => {
    if (fetcher.state === "idle" && isImporting) {
      setIsImporting(false);
      if (fetcher.data?.ok) {
        setImportPreview(null);
        setImportErrors([]);
        if (importFileRef.current) importFileRef.current.value = "";
        // @ts-ignore
        shopify.modal.hide("import-reviews-modal");
      }
    }
  }, [fetcher.state, fetcher.data, isImporting]);

  return (
    <s-modal id="import-reviews-modal" heading="Import Reviews">
      <s-stack gap="base">
        <s-text>
          Upload a CSV file to import reviews. You can download the example CSV
          or use any exported reviews CSV. Image/video attachment links &#x20;
          <b>
            (separated by <code>|</code>)
          </b>{" "}
          &#x20; are fully supported.
        </s-text>
        {/* <s-text variant="headingSm">Upload CSV file</s-text> */}

        <s-button
          variant="tertiary"
          tone="neutral"
          onClick={handleDownloadExampleCsv}
          icon="download"
        >
          Download example.csv
        </s-button>

        <s-stack gap="small">
          <s-drop-zone
            label="Upload CSV file. Maximum file size: 10MB."
            accessibilityLabel="Upload CSV file"
            accept=".csv"
            onChange={handleImportFileChange}
            onDropRejected="console.log('onDropRejected', event.currentTarget?.value)"
          ></s-drop-zone>
        </s-stack>

        {importErrors.length > 0 && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              padding: "10px 12px",
              maxHeight: "160px",
              overflowY: "auto",
            }}
          >
            {importErrors.map((err, idx) => (
              <s-text key={idx} tone="critical">
                {err}
              </s-text>
            ))}
          </div>
        )}

        {importPreview && (
          <s-stack gap="small">
            <s-text tone="success">
              {importPreview.length} valid review
              {importPreview.length === 1 ? "" : "s"} found and ready to import.
            </s-text>
            <div
              style={{
                overflowX: "auto",
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                maxHeight: "200px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "12px",
                  minWidth: "1600px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f6f6f7" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Product Title
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Product Handle
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Product ID
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Reviewer Name
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Reviewer Email
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Reviewer Phone
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Rating
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Title
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Body
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Source
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Verified
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Attachments
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Reply
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {idx + 1}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.productTitle || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.productHandle || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.productId || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.reviewerName || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.reviewerEmail || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.reviewerPhone || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                          fontWeight: "bold",
                        }}
                      >
                        {row.rating} ★
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.title || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          maxWidth: "240px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.body || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.status}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.source || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.isVerified ? "Yes" : "No"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.attachmentUrls && row.attachmentUrls.length > 0
                          ? `${row.attachmentUrls.length} file(s)`
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          maxWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.reply || "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.createdAt || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {importPreview.length > 5 && (
              <s-text color="subdued">
                ...and {importPreview.length - 5} more
              </s-text>
            )}
          </s-stack>
        )}
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        onClick={handleImportSubmit}
        disabled={!importPreview || importPreview.length === 0 || isImporting}
      >
        {isImporting
          ? "Importing..."
          : `Import ${importPreview?.length || 0} review${(importPreview?.length || 0) === 1 ? "" : "s"}`}
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="import-reviews-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  );
}
