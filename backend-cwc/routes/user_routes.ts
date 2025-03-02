import express from "express";
import UserControllers from "../controllers/user_controller";
import { Router } from "express";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

router.get("/getUserById/:id", UserControllers.getUserById);

router.get("/getUsers", UserControllers.getUsers);

router.delete("/deleteUser/:id", UserControllers.deleteUser);

router.put("/updateUser/:id", UserControllers.updateUser);

export default router;
