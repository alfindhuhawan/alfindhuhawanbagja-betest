import express from "express"
import userController from "../controllers/user-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const userRouter = new express.Router();
userRouter.use(authMiddleware)

// USER API
userRouter.post("/api/users", userController.create)
userRouter.get("/api/users", userController.getAll)
userRouter.get("/api/users/:typeSearch/:paramSearch", userController.getDetail)
userRouter.put("/api/users/:userId", userController.edit)
userRouter.delete("/api/users/:userId", userController.remove)

export {
    userRouter
}