import { Request , Response } from "express";
import User from "../models/user_model";
import jwt from "jsonwebtoken";

const getUserById = async (req: Request, res: Response): Promise<void>  => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
        return;
    } catch (error) {
         res.status(500).json({ message: "Internal server error" });
         return;
    }
}

const getUsers = async (req: Request, res: Response): Promise<void>  => {
    try {
        const users = await User.find();
        res.status(200).json(users);
        return;
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

const deleteUser = async (req: Request, res: Response): Promise<void>  => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ message: "User deleted successfully" });
        return;

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

const updateUser = async (req: Request, res: Response): Promise<void>  => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, req.body)
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ message: "User updated successfully" });
        return;
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}


const userController = { getUserById, getUsers, deleteUser, updateUser };
export default userController;