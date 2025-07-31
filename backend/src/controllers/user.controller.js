import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = asyncHandler(async (userId) => {
  if (!userId) {
    throw new ApiError(
      400,
      "UserId is required to generate access and refresh token"
    );
  }
  const user = await User.findOne({ _id: userId });
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;

  console.log(accessToken, refreshToken);

  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!(username && password)) {
    throw new ApiError(401, "Password is not received");
  }
  console.log("userdata received at backend", req.body);
  const user = await User.findOne({ username });
  if (!user?._id) {
    throw new ApiError(400, "User doesnot exist");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Wrong Password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user?._id
  );

  const options = {
    httpOnly: true,
    secure: false,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          _id: user?._id,
          username: user?.username,
          fullName: user?.fullName,
          profilePic: user?.profilePic,
          accessToken: accessToken,
        },
        "User Login Succesfull"
      )
    );
});

const signup = asyncHandler(async (req, res) => {
  const { username, fullName, profilePic, password } = req.body;
  console.log("received data at backend is:", req.body);
  if (!(username && fullName && password)) {
    throw new ApiError(400, "All fields are required to signup");
  }
  const user = await User.findOne({ username });

  if (user?._id) {
    throw new ApiError(400, "Username already exists/in-use");
  }

  const newUser = await User.create({
    fullName: fullName,
    username: username,
    profilePic: profilePic || "",
    password: password,
  });

  await newUser.save();

  const createdUser = await User.findOne({ _id: newUser?._id }).select(
    "-password -refreshToken"
  );

  if (!createdUser?._id) {
    throw new ApiError(400, "Something went wrong while creating the user");
  }
  const options = {
    httpOnly: true,
    secure: false,
  };

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    createdUser?._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { ...createdUser, accessToken },
        "User Created Succesfully"
      )
    );
});

export { login, signup };
