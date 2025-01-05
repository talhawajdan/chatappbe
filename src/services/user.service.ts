import UserModel, { UserInput, UserUpdate } from "@models/user.model";
import { omit } from "lodash";
import mongoose, { Types } from "mongoose";

async function createUser(input: UserInput) {
  try {
    const user = await UserModel.create(input);

    return omit(user.toJSON(), "password", "__v");
  } catch (e: any) {
    throw new Error(e.message);
  }
}

async function FindUserByEmail(email: string) {
  try {
    const user = await UserModel.findOne({ email: email })
      .select("+password")
      .lean();
    if (!user) {
      throw new Error("no user found");
    }
    return omit(user, "__v");
  } catch (error: any) {
    throw new Error(error.message);
  }
}
async function FindUserById(userId: string) {
  try {
    const user = await UserModel.findOne({ _id: userId }).lean();
    if (!user) {
      throw new Error("no user found");
    }
    return omit(user, "__v");
  } catch (error: any) {
    throw new Error(error.message);
  }
}
async function UpdateUser(userId: string, input: UserUpdate) {
  try {
    const { firstName, lastName, dob, phone } = input;
    const user = await UserModel.findOneAndUpdate(
      { _id: userId },
      { firstName, lastName, dob, phone },
      {
        new: true,
      }
    );
    return omit(user, "__v");
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function uploadUserAvatar(userId: string, avatar: any) {
  try {
    const user: any = await UserModel.findById({ _id: userId });
    if (!user) {
      throw new Error("no user found");
    }
    user.avatar = avatar;
    await user.save();
    return omit(user, "__v");
  } catch (error: any) {
    throw new Error(error.message);
  }
}
async function deleteUserAvatar(userId: string) {
  try {
    const user: any = await UserModel.findById({ _id: userId });
    user.avatar = null;
    await user.save();
    return omit(user, "__v");
  } catch (error: any) {
    throw new Error(error.message);
  }
}
async function searchUsers(
  query: string,
  skip: number,
  limit: number,
  userId: string
) {
  try {
    console.log(userId);

    const user: any = await UserModel.aggregate([
      {
        $facet: {
          users: [
            {
              $match: {
                _id: { $ne: new mongoose.Types.ObjectId(userId) },
                friends: { $ne: new mongoose.Types.ObjectId(userId) }, // Exclude the current user userId },
                $or: [
                  { firstName: { $regex: query, $options: "i" } },
                  { lastName: { $regex: query, $options: "i" } },
                ],
              },
            },

            {
              $lookup: {
                from: "requests", // Replace with the actual collection name for requests
                let: { userId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$receiver", "$$userId"],
                          },
                        },
                        {
                          $expr: {
                            $eq: [
                              "$sender",
                              new mongoose.Types.ObjectId(userId),
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $project: { _id: 1, hasRequest: "true" },
                  },
                ],
                as: "matchedRequests",
              },
            },
            {
              $addFields: {
                hasRequest: {
                  $cond: {
                    if: { $gt: [{ $size: "$matchedRequests" }, 0] },
                    then: true,
                    else: false,
                  },
                },
              },
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                "avatar.url": 1,
                email: 1,
                hasRequest: 1,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
        },
      },
    ]);
    const total = await UserModel.countDocuments({
      _id: { $ne: new mongoose.Types.ObjectId(userId) },
      friends: { $ne: new mongoose.Types.ObjectId(userId) }, // Exclude the current user userId
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
    });
    const result = user[0];
    const totalPages = Math.ceil(total / limit) || 0;

    return { user: result, totalPages, total };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function updateUserFriends(userId: string, friendId: string) {
  try {
    const user: any = await UserModel.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Check if friendId already exists in the friends array
    if (user.friends.includes(friendId)) {
      throw new Error("This user is already a friend");
    }

    const updateUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { friends: friendId } }, // Ensures friendId is added only if not already present
      { new: true } // Returns the updated document
    );
    return omit(updateUser, "__v");
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getUsersFriends(
  userId: string,
  skip: number,
  limit: number,
  search: string
) {
  try {
    const friends: any = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId), // Match the specific user document
        },
      },
      {
        $lookup: {
          from: "users", // Collection to populate friends from
          localField: "friends", // Field containing friend IDs
          foreignField: "_id", // Corresponding field in the "users" collection
          as: "friends", // The resulting array of populated friends
        },
      },
      {
        $unwind: "$friends", // Split the array into individual documents for filtering
      },
      {
        $match: {
          "friends.firstName": {
            $regex: search, // Replace 'searchKeyword' with the user input for search
            $options: "i", // Case-insensitive matching
          },
        },
      },
      {
        $group: {
          _id: "$_id", // Re-group back into a single document per user
          firstName: { $first: "$firstName" }, // Include fields from the main document
          lastName: { $first: "$lastName" },
          email: { $first: "$email" },
          friends: { $push: "$friends" }, // Rebuild the friends array with filtered results
        },
      },
      {
        $addFields: {
          totalFriends: { $size: "$friends" }, // Add total friends count for pagination metadata
        },
      },
      {
        $project: {
          _id: 0,
          friends: 1,
          totalFriends: 1,
        },
      },
      {
        $skip: skip, // Skip the first 10 records (page 2 for page size 10)
      },
      {
        $limit: limit, // Limit to 10 records per page
      },
    ]);
    const friendsData = friends[0];

    const total = friendsData?.totalFriends || 0;
    const totalPages = Math.ceil(total / limit) || 0;

    return { friends: friendsData, total, limit, totalPages };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function removeFriend(userId: string, friendId: string) {
  try {
    const user: any = await UserModel.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Convert friendId to ObjectId for comparison
    const friendObjectId = new Types.ObjectId(friendId);

    if (!user.friends.some((id: any) => id.equals(friendObjectId))) {
      throw new Error("This user is not a friend");
    }
    user.friends = user.friends.filter((id: any) => !id.equals(friendObjectId));
    await user.save();
    return omit(user, "__v");
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getUsersFriendsList(userId: string) {
  try {
    const user: any = await UserModel.findById(userId, {
      friends: 1,
      _id: 0,
    }).populate("friends", { firstName: 1, lastName: 1, email: 1, avatar: 1 });

    if (!user) {
      throw new Error("User not found");
    }

    return omit(user, "__v");
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export {
  createUser,
  deleteUserAvatar,
  FindUserByEmail,
  FindUserById,
  getUsersFriends,
  removeFriend,
  searchUsers,
  UpdateUser,
  updateUserFriends,
  uploadUserAvatar,
  getUsersFriendsList,
};
