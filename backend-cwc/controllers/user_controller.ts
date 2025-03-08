import { Request , Response } from "express";
import User from "../models/user_model";

const getUserById = async (req: Request, res: Response): Promise<void>  => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({_id : user._id, name: user.name , email: user.email ,
            bio: user.bio , favorite_coffee: user.favorite_coffee , location: user.location, 
            followers_count: user.followers_count , following_count: user.following_count , posts_count: user.posts_count , 
            profile_pic: user.profile_pic
          });  
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