import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({debug: true});

const app = express();
app.use(express.json())
app.use(cors())

// here routes shoudl be registered

export default app;



