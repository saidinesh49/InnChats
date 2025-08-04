import { FriendsList } from "../models/friendsList.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getFriendsList = asyncHandler(async (req, res) => {
  const friends = await FriendsList.findOne({ owner: req?.user?._id });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ...friends?.friends },
        "friends list fetched succesfuly"
      )
    );
});

export { getFriendsList };
