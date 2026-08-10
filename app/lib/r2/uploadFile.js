import { r2Client } from "./r2.config";
import { PutObjectCommand } from "@aws-sdk/client-s3";

function getFolder(fileType) {
  if (fileType.startsWith("video/")) return "uploads/videos";
  if (fileType.startsWith("image/")) return "uploads/images";

  return null;
}

export async function uploadR2File(file) {
  const folder = getFolder(file.type);

  if (!folder) {
    throw new Error(
      `Unsupported file type: ${file.type}. Only images and videos are allowed.`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const extension = file.name.split(".").pop();

  // filename without extension
  const fileName = file.name.replace(/\.[^/.]+$/, "");

  // Same filename format as your S3
  const now = new Date();

  const dateTime =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0") +
    "-" +
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0") +
    ":" +
    String(now.getSeconds()).padStart(2, "0") +
    "-" +
    Date.now();

  const key = `${folder}/${fileName}-${dateTime}.${extension}`;

  console.log("Uploading R2 key:", key);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,

      // R2 does not need ACL: public-read
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    originalName: file.name,

    // Your R2 public/custom domain
    url: `${process.env.R2_PUBLIC_ENDPOINT}/${key}`,

    type: file.type,
    folder,
  };
}
