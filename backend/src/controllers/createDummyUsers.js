import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

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

seedNewUserToDB();
