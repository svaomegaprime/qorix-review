import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "./r2.config";

export async function deleteR2File(fileUrl) {
  try {
    const publicEndpoint = process.env.R2_PUBLIC_ENDPOINT;

    if (!publicEndpoint) {
      throw new Error("R2_PUBLIC_ENDPOINT is not configured.");
    }

    // Remove endpoint from URL
    const key = fileUrl.replace(`${publicEndpoint}/`, "").split("?")[0];

    if (!key) {
      throw new Error("Invalid R2 file URL.");
    }

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }),
    );

    console.log("R2 file deleted successfully:", key);

    return {
      success: true,
      key,
    };
  } catch (error) {
    console.error("R2 delete file error:", error);
    throw error;
  }
}
