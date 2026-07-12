import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3.config";

export async function deleteFile(fileUrl) {
  try {
    const bucket = process.env.ZENEX_BUCKET_NAME;

    const key = fileUrl.split(`/${bucket}/`)[1];

    if (!key) {
      throw new Error("Invalid file URL.");
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    console.log("File deleted successfully:", key);

    return {
      success: true,
      key,
    };
  } catch (error) {
    console.error("Delete file error:", error);
    throw error;
  }
}
