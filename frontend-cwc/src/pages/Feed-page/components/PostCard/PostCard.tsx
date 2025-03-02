import postCardStyles from "./PostCard.module.css";
import { Heart, MessageSquare } from "lucide-react";
import { urlImage , getUsernameById } from "../../../../services/apiServices";
import { useEffect ,useState } from "react";

interface Post {
  _id: string;
  userId: string;
  content: string;
  image: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {

  const [username, setUsername] = useState<string>('');
  useEffect(() => {
    getUsernameById(post.userId).then((username) => {
      setUsername(username);
    });
  }, [post.userId]);


  return (
    <div className={postCardStyles.postCard}>
      <div className={postCardStyles.header}>
        <div className={postCardStyles.profilePic}>
        </div>
        <span className={postCardStyles.username}>
          {username}
        </span>
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
        <button className={postCardStyles.button}>
          <Heart size={20} /> Like
        </button>
        <button className={postCardStyles.button}>
          <MessageSquare size={20} /> Comment
        </button>
      </div>
    </div>
  );
}
