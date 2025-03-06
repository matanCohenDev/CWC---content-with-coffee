import postCardStyles from "./PostCard.module.css";
import { Heart, MessageSquare } from "lucide-react";
import { urlImage, getUsernameById, likePost, removeLike, checkIfUserAlreadyLiked, getUserIdFromToken } from "../../../../services/apiServices";
import { useEffect, useState } from "react";

interface Post {
  _id: string;
  userId: string;
  content: string;
  image: string;
  likesCount: number;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [username, setUsername] = useState<string>('');
  const [liked, setLiked] = useState<boolean>(false);
  const [likeId, setLikeId] = useState<string>('');
  const userId = getUserIdFromToken(localStorage.getItem("accessToken") || "");

  useEffect(() => {
    const checkIfUserLiked = async () => {
      try {
        const response = await checkIfUserAlreadyLiked(post._id);
        const likesData = response.likes; 
        if (Array.isArray(likesData)) {
          likesData.forEach((like: any) => {
            if (like.userId === userId) {
              setLiked(true);
              setLikeId(like._id);
            }
          });
        } else {
          console.warn("Expected an array but got:", likesData);
        }
      } catch (error) {
        console.error("Error in checkIfUserLiked:", error);
      }
    };
    checkIfUserLiked();
  }, [post._id, userId]);
  
  useEffect(() => {
    getUsernameById(post.userId).then((username) => {
      setUsername(username);
    });
  }, [post.userId]);

  const onhandleClickLike = () => {
    likePost(post._id).then((response) => {
      post.likesCount += 1;
      setLiked(true);
      setLikeId(response.data._id);
    });
  };

  const onhandleClickRemoveLike = () => {
    removeLike(likeId, post._id).then(() => {
      post.likesCount -= 1;
      setLiked(false);
    });
  };

  return (
    <div className={postCardStyles.postCard}>
      <div className={postCardStyles.header}>
        <div className={postCardStyles.profilePic}></div>
        <span className={postCardStyles.username}>{username}</span>
      </div>

      <div className={postCardStyles.postImage}>
        <img 
          src={urlImage(post.image)}
          alt="Post" 
          className={postCardStyles.image} 
        />
      </div>

      <p className={postCardStyles.body}>{post.content}</p>

      <div className={postCardStyles.actions}>
        <button 
          className={postCardStyles.button} 
          onClick={liked ? onhandleClickRemoveLike : onhandleClickLike}>
          <Heart size={20} color={liked ? "red" : "black"} /> {post.likesCount} Like
        </button>
        <button className={postCardStyles.button}>
          <MessageSquare size={20} /> Comment
        </button>
      </div>
    </div>
  );
}
