import { Model, model, Schema } from "mongoose";

const userSchema: Schema<UserInterface> = new Schema<UserInterface>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: {
    type: String,
    // required: true,
    // default: DEFAULT_PROFILE,
  },
  name: {
    type: String,
    required: false,
  },
  userType: {
    type: String,
    required: true,
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

const User: Model<UserInterface> = model("User", userSchema);
export default User;


interface UserInterface {
    email: string;
    profilePicture: string;
    name: string;
    userType: string;
    isVerified: boolean;
    password: string;
}