import postCardStyles from "./postCard.module.css";
import Comments from "./Comments/Comments";
import { Delete, Edit, Heart, MessageSquare } from "lucide-react";
import EditPost from "./EditPost/EditPost";
import { 
  urlImage, 
  getUsernameById, 
  likePost, 
  removeLike, 
  checkIfUserAlreadyLiked, 
  getUserIdFromToken, 
  deletePost ,
  getCommentsByPostId
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
  const [postData, setPostData] = useState<Post>(post);
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

  const onhandleClickLike = async () => {
    try {
      const response = await likePost(post._id);
      setPostData(prev => ({
        ...prev,
        likesCount: prev.likesCount + 1
      }));
      setLiked(true);
      setLikeId(response.data._id);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const onhandleClickRemoveLike = async () => {
    try {
      await removeLike(likeId, post._id);
      setPostData(prev => ({
        ...prev,
        likesCount: prev.likesCount - 1
      }));
      setLiked(false);
    } catch (error) {
      console.error("Error removing like:", error);
    }
  };

  const onClickDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId);
        window.location.reload();
        alert("Post deleted successfully");
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleCommentsClose = async () => {
    setShowComments(false);
    try {
      const commentsData = await getCommentsByPostId(postData._id);
      setPostData(prev => ({
        ...prev,
        commentsCount: commentsData.length,
      }));
    } catch (error) {
      console.error("Error updating comments count:", error);
    }
  };
  

  return (
    <>
      <div className={`${postCardStyles.postCard} ${variant === "large" ? postCardStyles.large : postCardStyles.small}`}>
        <div className={postCardStyles.header}>
          <span className={postCardStyles.username}>{username}</span>
          {variant === "large" && profileId === "profile" && (
            <div className={postCardStyles.actions}>
              <button 
                className={postCardStyles.button}
                onClick={() => setShowEditPost(true)}>
                <Edit size={20} />
              </button>
              <button 
                className={postCardStyles.button}
                onClick={() => onClickDelete(postData._id)}>
                <Delete size={20} />
              </button>
            </div>
          )}
        </div>

        <div className={postCardStyles.postImage}>
          <img 
            src={urlImage(postData.image)}
            alt="Post" 
            className={postCardStyles.image} 
          />
        </div>

        <p className={postCardStyles.body}>{postData.content}</p>

        <div className={postCardStyles.actions}>
          <button 
            className={postCardStyles.button} 
            onClick={liked ? onhandleClickRemoveLike : onhandleClickLike}>
            <Heart size={20} color={liked ? "red" : "black"} /> {postData.likesCount} 
          </button>
          <div className={postCardStyles.spacer}></div>
          <button 
            className={postCardStyles.button} 
            onClick={() => setShowComments(true)}>
            <MessageSquare size={20} /> {postData.commentsCount}
          </button>
        </div>
      </div>
      
      {showComments && (
        <Comments postId={postData._id} onClose={handleCommentsClose} />
      )}


      {showEditPost && (
        <EditPost
          postId={postData._id}
          initialContent={postData.content}
          initialImageUrl={urlImage(postData.image)}
          onClose={() => setShowEditPost(false)}
          onSave={(updatedPost) => {
            setPostData(prev => ({
              ...prev,
              content: updatedPost.content,
              image: updatedPost.imageUrl,
            }));
            setShowEditPost(false);
          }}
        />
      )}
    </>
  );
}
