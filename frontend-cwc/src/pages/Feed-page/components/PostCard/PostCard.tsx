import React from "react";
import postCardStyles from "./PostCard.module.css";
import { Heart, MessageSquare } from "lucide-react";

export default function PostCard() {
    return (
        <div className={postCardStyles.postCard}>
            {/* Header עם תמונת פרופיל ושם */}
            <div className={postCardStyles.header}>
                <div className={postCardStyles.profilePic}></div>
                <span className={postCardStyles.username}>Username</span>
            </div>

            {/* תמונת הפוסט */}
            <div className={postCardStyles.postImage}></div>

            {/* טקסט של הפוסט */}
            <p className={postCardStyles.body}>This is a beautiful cup of coffee!</p>

            {/* אזור האינטראקציה */}
            <div className={postCardStyles.actions}>
                <button className={postCardStyles.button}><Heart size={20} /> Like</button>
                <button className={postCardStyles.button}><MessageSquare size={20} /> Comment</button>
            </div>
        </div>
    );
}
