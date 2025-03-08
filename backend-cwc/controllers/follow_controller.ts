import { Request, Response } from "express";
import Follow  from "../models/follow_model";
import User from "../models/user_model";

const follow = async (req: Request, res: Response):Promise<void> => {
    const { followingId } = req.body;
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const followerId = req.user._id;
    try {
        const follow = await Follow.findOne({ follower : followerId, following : followingId });
        if (follow) {
            res.status(400).json({ message: "Already following" });
            return;
        }
        
        const newFollow = new Follow({ followerId, followingId });
        await newFollow.save();
        const followingUser = await User.findById(followingId);
        if (!followingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (typeof followingUser.followers_count === 'number') {
            followingUser.followers_count += 1;
        } else {
            followingUser.followers_count = 1;
        }

        const followerUser = await User.findById(followerId);
        if (!followerUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (typeof followerUser.following_count === 'number') {
            followerUser.following_count += 1;
        } else {
            followerUser.following_count = 1;
        }
        await followingUser.save();
        await followerUser.save();
        res.status(200).json({ message: "Followed" });
    
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
        return;
    }
};

const unfollow = async (req: Request, res: Response): Promise<void> => {
    const { followingId } = req.body;
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const followerId = req.user._id;
  
    try {
      const follow = await Follow.findOne({ followerId: followerId, followingId: followingId });
      if (!follow) {
        res.status(400).json({ message: "Not following" });
        return;
      }
  
      const followingUser = await User.findById(followingId);
      if (!followingUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      if (typeof followingUser.followers_count === 'number') {
        followingUser.followers_count -= 1;
      } else {
        followingUser.followers_count = 0;
      }
      await followingUser.save(); 
  
      const followerUser = await User.findById(followerId);
      if (!followerUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      if (typeof followerUser.following_count === 'number') {
        followerUser.following_count -= 1;
      } else {
        followerUser.following_count = 0;
      }
      await followerUser.save(); 
  
      await Follow.findByIdAndDelete(follow._id);
  
      res.status(200).json({ message: "Successfully unfollowed", success: true });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
      return;
    }
  };
  

const getAllFollowersByUserId = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    try {
        const followers = await Follow.find({ following: userId });
        res.status(200).json(followers);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
        return;
    }
};

const getAllFollowingByUserId = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    try {
        const following = await Follow.find({ followerId: userId });
        res.status(200).json({ following });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
        return;
    }
};

const followController = { follow, unfollow , getAllFollowersByUserId, getAllFollowingByUserId };
export { followController };


