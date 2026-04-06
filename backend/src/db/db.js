import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error(
            "Missing MONGO_URI. Add it to backend/.env before starting the server."
        );
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export  {connectDB};
