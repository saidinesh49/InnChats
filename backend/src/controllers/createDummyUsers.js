import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { FriendRequest } from "../models/friendRequest.model.js";
import { FriendsList } from "../models/friendsList.model.js";

const noOfUsers = 100;

const seedNewUserToDB = async () => {
  try {
    // Connect to DB
    await mongoose.connect(
      "mongodb+srv://saidineshp:eECnV1bqtCnHcGwO@innchats.qsgsvsf.mongodb.net/InnChats"
    );

    // Generate fake users
    const users = [];
    for (let i = 0; i < noOfUsers; i++) {
      const newUser = await User.create({
        username: faker.internet.userName().toLowerCase() + i,
        fullName: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: "1234",
        profilePic: faker.image.avatar(),
      });
      await newUser.save();
      users.push(newUser);
    }

    // Insert into DB
    const newUsers = await User.insertMany(users);
    console.log(`✅ Successfully inserted ${newUsers.length} users!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
};

// seedNewUserToDB();

const seedFriendList = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://saidineshp:eECnV1bqtCnHcGwO@innchats.qsgsvsf.mongodb.net/InnChats"
    );

    const user = await User.findOne({ username: "Dinesh01" });
    if (!user) throw new Error("User not found");

    // Get all other user IDs
    const allOtherUsers = await User.find(
      { _id: { $ne: user._id } },
      { _id: 1 }
    ).lean();

    const allOtherUserIds = allOtherUsers.map((u) => u._id.toString());

    // Find current friends
    const existingFriends = await FriendsList.findOne({
      owner: user._id,
    }).lean();
    const existingFriendIds = new Set(
      (existingFriends?.friends || []).map((f) => f.toString())
    );

    // Filter new friends that aren't already in the list
    const newFriends = allOtherUserIds.filter(
      (id) => !existingFriendIds.has(id)
    );

    if (newFriends.length > 0) {
      await FriendsList.updateOne(
        { owner: user._id },
        { $push: { friends: { $each: newFriends } } },
        { upsert: true }
      );
      console.log(
        `✅ Added ${newFriends.length} new friends to Dinesh01's list`
      );
    } else {
      console.log("⚠️ No new friends to add");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding friends list:", error);
    process.exit(1);
  }
};

seedFriendList();
