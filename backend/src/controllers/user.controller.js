import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIAT4JNAEFPN4ISX5Q4",
    secretAccessKey: "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",
  },
  maxAttempts: 3,
  retryMode: "adaptive",
});

const generateAccessAndRefreshToken = asyncHandler(async (userId) => {
  if (!userId) {
    throw new ApiError(
      400,
      "UserId is required to generate access and refresh token"
    );
  }
  console.log("genreation stared");
  const user = await User.findOne({ _id: userId });
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });
  const tokens = { accessToken, refreshToken };
  console.log("at generation", accessToken);
  return tokens;
});

const login = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!(usernameOrEmail && password)) {
    throw new ApiError(401, "Username & Password is required");
  }
  console.log("userdata received at backend", req.body);
  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });
  if (!user?._id) {
    throw new ApiError(400, "User doesnot exist");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Wrong Password");
  }
  console.log("user is:", user);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  const options = {
    httpOnly: true,
    secure: false,
  };
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user?._id,
        username: user?.username,
        fullName: user?.fullName,
        profilePic: user?.profilePic,
        accessToken: accessToken || "",
        refreshToken: refreshToken || "",
      },
      "User Login Succesfull"
    )
  );
});

const signup = asyncHandler(async (req, res) => {
  const { username, fullName, profilePic, password, email } = req.body;
  console.log("received data at backend is:", req.body);
  if (!(username && fullName && password && email)) {
    throw new ApiError(400, "All fields are required to signup");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (user?._id) {
    throw new ApiError(400, "Username or Email already in-use");
  }

  const newUser = await User.create({
    fullName: fullName,
    username: username,
    email: email,
    profilePic: profilePic || "",
    password: password,
  });

  await newUser.save();

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser?._id) {
    throw new ApiError(400, "Something went wrong while creating the user");
  }
  const options = {
    httpOnly: true,
    secure: false,
  };

  const accessToken = await createdUser.generateAccessToken();
  const refreshToken = await createdUser.generateRefreshToken();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: createdUser?._id,
        username: createdUser?.username,
        fullName: createdUser?.fullName,
        profilePic: createdUser?.profilePic,
        accessToken: accessToken || "",
        refreshToken: refreshToken || "",
      },
      "User Created Succesfully"
    )
  );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log("Current User Verified!", req?.user);
  return res
    .status(200)
    .json(new ApiResponse(200, req?.user, "current user fetched successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const allUsers = await User.aggregate([
    {
      $project: {
        _id: 1,
        username: 1,
        fullName: 1,
        profilePic: 1,
        password: 0,
        refreshToken: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, allUsers, "All users fetched Successfully"));
});

const googleLogin = asyncHandler(async (req, res) => {
  const { firstName, email, fullName, profilePic } = req.body;
  if (!(firstName && email && fullName && profilePic)) {
    throw new ApiError(400, "All fields are required for google login");
  }

  const randomNumber = Math.floor(Math.random() * 5000) + 5000;
  const username = `${firstName}${randomNumber}`;

  const user = await User.findOne({ email: email });

  if (!user?._id) {
    const newUser = await User.create({
      username: username,
      email: email,
      fullName: fullName,
      password: email,
      profilePic: profilePic || "",
    });

    await newUser.save();

    const accessToken = await newUser.generateAccessToken();
    const refreshToken = await newUser.generateRefreshToken();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          _id: newUser?._id,
          username: newUser?.username,
          fullName: newUser?.fullName,
          profilePic: newUser?.profilePic,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "Google SignedUp Succesfull"
      )
    );
  }
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user?._id,
        username: user?.username,
        fullName: user?.fullName,
        profilePic: user?.profilePic,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      "Google Login Succesfull"
    )
  );
});

const editProfileDetails = asyncHandler(async (req, res) => {
  const { newFullName, newPassword, newUsername } = req.body;
  const userId = req?.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized");

  // Update non-password fields first
  const updateData = {};
  if (newFullName) updateData.fullName = newFullName;
  if (newUsername) updateData.username = newUsername;

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (newPassword != null && newPassword !== "") {
    updatedUser.password = newPassword;
    await updatedUser.save();
  }

  if (!updatedUser) throw new ApiError(404, "User not found");

  const userToReturn = updatedUser.toObject();
  delete userToReturn.password;

  return res
    .status(200)
    .json(new ApiResponse(200, userToReturn, "Profile updated successfully"));
});

const updateProfilePic = asyncHandler(async (req, res) => {
  const { newProfilePicUrl } = req.body;
  if (!req?.user?._id) {
    throw new ApiError(401, "Unauthorized User");
  }

  // Find user first
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if current profilePic is an S3 URL to delete old pic if needed
  const currentPicUrl = user.profilePic || "";
  const s3Domain = `https://innchats.s3.ap-south-1.amazonaws.com/`;

  if (currentPicUrl.startsWith(s3Domain)) {
    // Extract Key from URL
    const key = currentPicUrl.replace(s3Domain, "");

    try {
      // Delete old object from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: "innchats",
        Key: key,
      });
      await s3.send(deleteCommand);
    } catch (error) {
      console.warn("Warning: Could not delete old profile pic from S3:", error);
    }
  }

  user.profilePic = newProfilePicUrl;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "profile pic update successfuly"
    )
  );
});

export {
  login,
  signup,
  getCurrentUser,
  getAllUsers,
  googleLogin,
  editProfileDetails,
  updateProfilePic,
};
