import User from "../models/user.model";

export const getUserByEmail = async (email: string) => {
    const user = await User.findOne({ email });
    return user;
};

export const getUserById = async (userId: string) => {
    const user = await User.findOne({ _id: userId });
    return user;
};