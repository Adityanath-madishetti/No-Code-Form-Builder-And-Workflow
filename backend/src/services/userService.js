import User from "../models/User.js";
import { createError } from "../middleware/errorHandler.js";

export async function syncUserService(userData) {
    const { uid, email, name, picture } = userData;

    return User.findOneAndUpdate(
        { uid },
        {
            $set: {
                email: email || "",
                displayName: name || "",
                avatarUrl: picture || "",
                lastLogin: new Date(),
            },
            $setOnInsert: {
                uid,
                roles: ["user"],
                accountStatus: "active",
            },
        },
        { upsert: true, returnDocument: 'after', runValidators: true }
    );
}

export async function getMeService(uid) {
    const user = await User.findOne({ uid });

    if (!user) {
        throw createError(404, "User not found. Please sync first.");
    }

    return user;
}

export async function updateMeService(uid, payload) {
    const allowedFields = ["displayName", "avatarUrl"];
    const updates = {};

    for (const field of allowedFields) {
        if (payload[field] !== undefined) {
            updates[field] = payload[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw createError(400, "No valid fields to update");
    }

    const user = await User.findOneAndUpdate(
        { uid },
        { $set: updates },
        { returnDocument: 'after', runValidators: true }
    );

    if (!user) {
        throw createError(404, "User not found");
    }

    return user;
}
