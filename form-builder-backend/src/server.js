import app from "./app.js"; 
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";


const PORT = process.env.PORT || 5000;
//loadenv
dotenv.config({debug: true});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

startServer();