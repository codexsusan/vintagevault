import mongoose, { Model, model, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  email: string;
  profilePicture: string;
  name: string;
  userType: string;
  bio: string;
  isVerified: boolean;
  password: string;
}

const userSchema: Schema<IUser> = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: {
    type: String,
  },
  name: {
    type: String,
    required: false,
  },
  userType: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: false,
    default: "",
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
});

const User: Model<IUser> = model("User", userSchema);
export default User;
