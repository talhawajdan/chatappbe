import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";

// Define the UserDocument interface extending mongoose.Document
export interface UserInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  dob: string;
  avatar?:{
    public_id?: string;
    url?: string;
  }
}
export interface UserUpdate {
  firstName: string;
  lastName: string;
  dob:string;
  phone:string;
}

export interface UserDocument extends UserInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Middleware for hashing the password before saving
userSchema.pre<UserDocument>("save", async function (next) {
  const user = this;

  // Only hash the password if it has been modified
  if (!user.isModified("password")) return next();

  const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
  const hash = await bcrypt.hash(user.password, salt);

  user.password = hash;
  next();
});

// Create the model
const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
