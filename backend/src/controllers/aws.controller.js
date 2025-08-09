import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create S3 client with v3 SDK and enhanced configuration
const createS3Client = () => {
  try {
    return new S3Client({
      region: "ap-south-1" || process.env.AWS_REGION,
      credentials: {
        accessKeyId: "AKIAT4JNAEFPOT6R4LEV" || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:
          "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" ||
          process.env.AWS_SECRET_ACCESS_KEY,
      },
      // Add retry configuration
      maxAttempts: 3,
      retryMode: "adaptive",
    });
  } catch (error) {
    console.error("Failed to create S3 client:", error);
    throw error;
  }
};

const s3 = createS3Client();

const uploadFileToAWS = asyncHandler(async (req, res) => {
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    throw new ApiError(400, "Both fileName and fileType are required");
  }

  // Folder path inside bucket
  const Key = `users/profilepic/${Date.now()}-${fileName}`;

  console.log("🔄 Generating presigned URL for:", {
    bucket: "innchats" || process.env.AWS_S3_BUCKET_NAME,
    key: Key,
    region: "ap-south-1" || process.env.AWS_REGION,
    contentType: fileType,
  });

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;

    console.log("✅ Presigned URL generated successfully");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { uploadUrl, fileUrl },
          "Presigned URL generated successfully"
        )
      );
  } catch (error) {
    console.error("❌ Error generating S3 URL:", {
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      stack: error.stack,
    });

    // Provide more specific error messages
    let errorMessage = "Failed to generate upload URL";
    if (error.message.includes("credential")) {
      errorMessage = "AWS credentials are invalid or expired";
    } else if (error.message.includes("Access Denied")) {
      errorMessage = "AWS credentials don't have required S3 permissions";
    } else if (error.message.includes("NoSuchBucket")) {
      errorMessage = `S3 bucket '${process.env.AWS_S3_BUCKET_NAME}' does not exist`;
    }

    throw new ApiError(500, errorMessage);
  }
});

export { uploadFileToAWS };
