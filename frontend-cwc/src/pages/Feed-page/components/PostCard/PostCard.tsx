import postCardStyles from "./postCard.module.css";
import Comments from "./Comments/Comments"; // Adjust the path as needed
import { Delete, Edit, Heart, MessageSquare } from "lucide-react";
import EditPost from "./EditPost/EditPost";
import { 
  urlImage, 
  getUsernameById, 
  likePost, 
  removeLike, 
  checkIfUserAlreadyLiked, 
  getUserIdFromToken , 
  deletePost
} from "../../../../services/apiServices";
import { useEffect, useState } from "react";

interface Post {
  _id: string;
  userId: string;
  content: string;
  image: string;
  likesCount: number;
  commentsCount: number;
}

interface PostCardProps {
  post: Post;
  variant?: "small" | "large";
  profileId?: "userProfile" | "profile" | "other";
}

export default function PostCard({ post, variant = "small", profileId = "other"  }: PostCardProps) {
  const [username, setUsername] = useState<string>('');
  const [liked, setLiked] = useState<boolean>(false);
  const [likeId, setLikeId] = useState<string>('');
  const [showComments, setShowComments] = useState<boolean>(false);
  const [showEditPost, setShowEditPost] = useState<boolean>(false);
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
          console.warn("Expected an array for likes but got:", likesData);
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

  const onClickDelete = (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePost(postId).then(() => {
        alert("Post deleted successfully");
        window.location.reload();
      });
    }
  }

  return (
    <>
      <div className={`${postCardStyles.postCard} ${variant === "large" ? postCardStyles.large : postCardStyles.small}`}>
        <div className={postCardStyles.header}>
          <span className={postCardStyles.username}>{username}</span>
          {variant === "large" && profileId == "profile" && (
            <div className={postCardStyles.actions}>
            <button 
              className={postCardStyles.button}
              onClick={() => setShowEditPost(true)}>
              <Edit size={20} />
            </button>
            <button 
            className={postCardStyles.button}
            onClick={() => onClickDelete(post._id)}>
            <Delete size={20} />
          </button>
          </div>
          )}
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
            <Heart size={20} color={liked ? "red" : "black"} /> {post.likesCount} 
          </button>
          <div className={postCardStyles.spacer}></div>
          <button 
            className={postCardStyles.button} 
            onClick={() => setShowComments(true)}>
            <MessageSquare size={20} /> {post.commentsCount}
          </button>
        </div>
      </div>
      
      {showComments && (
        <Comments postId={post._id} onClose={() => setShowComments(false)} />
      )}

      {showEditPost && (
        <EditPost
          postId={post._id}
          initialContent={post.content}
          initialImageUrl={urlImage(post.image)}
          onClose={() => setShowEditPost(false)}
          onSave={(updatedPost) => {
            post.content = updatedPost.content;
            post.image = updatedPost.imageUrl;
            setShowEditPost(false);
          }}
        />
      )}
    </>
  );
}
