import mongoose from "mongoose";

// uid comes from Firebase Auth

const UserSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },


        avatarUrl: {
            type: String
        },

        roles: {
            type: [String],
            default: ["user"]
        },
        
        accountStatus: {
            type: String,
            enum: ["active", "suspended"],
            default: "active"
        },

        lastLogin: {
            type: Date
        }
    },
    // gives created at and updated at automatically any time u touch the document in mongodb
    {
        timestamps: true
    }
);

export default mongoose.model("User", UserSchema);