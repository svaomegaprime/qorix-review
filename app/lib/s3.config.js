import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  // endpoint: () =>
  //   Promise.resolve({
  //     protocol: "http:",
  //     hostname: "bucket.zenexcloud.com",
  //     port: 9000,
  //     path: "/",
  //   }),

  endpoint: "http://bucket.zenexcloud.com:9000",

  region: process.env.ZENEX_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.ZENEX_ACCESS_KEY_ID,
    secretAccessKey: process.env.ZENEX_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  disableHostPrefix: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});
