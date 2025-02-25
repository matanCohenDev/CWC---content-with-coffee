import { Request,Response } from "express";
import User from "../models/user_model";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        if (!users) {
            res.status(404).json({ message: "No users found" });
            return;
        }
        res.status(200).json({ users, success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const getUserById = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ user, success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const updateUserById = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const { name, email, password } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        user.name = name;
        user.email = email;
        user.password = password;

        await user.save();
        res.status(200).json({ user, success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteUserById = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        await user.deleteOne();
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const UserController = { getAllUsers, getUserById, updateUserById, deleteUserById };
export default UserController;
        
