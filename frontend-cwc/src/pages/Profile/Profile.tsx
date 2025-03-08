import styles from "./profile.module.css";
import { useLocation } from "react-router-dom";
import { getAllPostsByUserId } from "../../services/apiServices";
import PostCard from "../Feed-page/components/PostCard/PostCard";
import { useState , useEffect} from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  location: string;
  bio: string;
  favorite_coffee: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

interface Post {
  _id: string;
  userId: string;
  content: string;
  image: string;
  likesCount: number;
  commentsCount: number;
}

export default function Profile(){  
  const location = useLocation();
  const { user } = location.state as { user: User };
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getAllPostsByUserId(user._id).then((data) => {
      setPosts(data.posts);
    });
  }, [user._id]);
  


  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <img
          src="https://via.placeholder.com/100"
          alt="Profile"
          className={styles.profilePic}
        />
        <div className={styles.rightSection}>
          <h2 className={styles.profileName}>{user?.name}</h2>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{user?.followers_count || 0}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{user?.following_count || 0}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{user?.posts_count || 0}</span>
              <span className={styles.statLabel}>Posts</span>
            </div>
          </div>
          <button className={styles.editButton}>Edit Profile</button>
        </div>
      </div>

      <div className={styles.info}>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Location:</strong> {user?.location}
        </p>
        <p>
          <strong>Bio:</strong> {user?.bio}
        </p>
        <p>
          <strong>Favorite Coffee:</strong> {user?.favorite_coffee}
        </p>
      </div>

      <div className={styles.postsContainer}>
      {Array.isArray(posts) ? posts.map((post) => (
          <PostCard key={post._id} post={post} variant="large" />
      )) : <p>No posts available</p>}
      </div>
    </div>
  );
};
