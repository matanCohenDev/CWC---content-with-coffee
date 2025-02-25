import express from "express";
import UserControllers from "../controllers/user_controller";

const router = express.Router();

router.get("/getAllUsers", UserControllers.getAllUsers);

router.get("/getUserById/:userId", UserControllers.getUserById);

router.put("/updateUserById/:userId", UserControllers.updateUserById);

router.delete("/deleteUserById/:userId", UserControllers.deleteUserById);

export default router;