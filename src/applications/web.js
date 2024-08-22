import express from "express"
import { errorMiddleware } from "../middlewares/error-middleware.js";
import { userRouter } from "../routes/api.js";
import connectDB from './database.js';
import { publicRouter } from "../routes/public-api.js"

export const web = express();
web.use(express.json());
connectDB();
web.use(publicRouter);
web.use(userRouter);
web.use(errorMiddleware)