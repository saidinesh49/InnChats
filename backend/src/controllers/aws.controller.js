import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIAT4JNAEFPN4ISX5Q4",
    secretAccessKey: "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",
  },
  maxAttempts: 3,
  retryMode: "adaptive",
});

const uploadFileToAWS = asyncHandler(async (req, res) => {
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    throw new ApiError(400, "Both fileName and fileType are required");
  }

  const randomSuffix = Math.floor(Math.random() * 5000) + 5000;
  const Key = `users/profilepic/${Date.now()}-${randomSuffix}-${fileName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: "innchats",
      Key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const fileUrl = `https://innchats.s3.ap-south-1.amazonaws.com/${Key}`;

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { uploadUrl, fileUrl, key: Key },
          "Presigned URL generated successfully"
        )
      );
  } catch (error) {
    console.error("Error generating S3 URL:", error);
    throw new ApiError(500, "Failed to generate upload URL");
  }
});

export { uploadFileToAWS };
