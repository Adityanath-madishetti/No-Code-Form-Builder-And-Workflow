import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        uid: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        displayName: {
            type: String,
            trim: true,
            default: "",
        },

        avatarUrl: {
            type: String,
            default: "",
        },

        roles: {
            type: [String],
            default: ["user"],
        },

        accountStatus: {
            type: String,
            enum: ["active", "suspended"],
            default: "active",
        },

        lastLogin: {
            type: Date,
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);
