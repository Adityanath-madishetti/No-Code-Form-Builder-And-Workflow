import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export async function loginByEmailService(emailInput) {
    if (!emailInput || typeof emailInput !== "string") {
        throw new Error("Email is required");
    }

    const normalizedEmail = emailInput.toLowerCase().trim();

    const uid = crypto
        .createHash("sha256")
        .update(normalizedEmail)
        .digest("hex")
        .slice(0, 24);

    const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
            $set: {
                email: normalizedEmail,
                lastLogin: new Date(),
            },
            $setOnInsert: {
                uid,
                displayName: normalizedEmail.split("@")[0],
                roles: ["user"],
                accountStatus: "active",
            },
        },
        { upsert: true, returnDocument: 'after', runValidators: true }
    );

    const token = jwt.sign(
        { uid: user.uid, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
        },
    };
}
