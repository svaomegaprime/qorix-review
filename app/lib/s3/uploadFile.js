import { s3Client } from "./s3.config";
import { PutObjectCommand } from "@aws-sdk/client-s3";

function getFolder(fileType) {
  if (fileType.startsWith("video/")) return "uploads/videos";
  if (fileType.startsWith("image/")) return "uploads/images";
  return null; 
}

export async function uploadFile(file) {
  const folder = getFolder(file.type);

  if (!folder) {
    throw new Error(`Unsupported file type: ${file.type}. Only images and videos are allowed.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const extension = file.name.split(".").pop();

  // filename without extension
  const fileName = file.name.replace(/\.[^/.]+$/, "");

  // 20260622-113045 format
  const now = new Date();
  const dateTime =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0") +
    "-" +
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0") +":" +
    String(now.getSeconds()).padStart(2, "0") + "-" + Date.now();

  const key = `${folder}/${fileName}-${dateTime}.${extension}`;

  console.log("Uploading key:", key);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.ZENEX_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    }),
  );

  return {
    originalName: file.name,
    url: `${process.env.ZENEX_PUBLIC_ENDPOINT}/${process.env.ZENEX_BUCKET_NAME}/${key}`,
    type: file.type,
    folder,
  };
}