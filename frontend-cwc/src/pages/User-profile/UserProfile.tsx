import styles from "./user-profile.module.css";
import { useLocation } from "react-router-dom";
import { getAllPostsByUserId, followUser , getAllFollowingByUserId , getUserIdFromToken , unfollowUser } from "../../services/apiServices";
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

interface Follow {
  _id: string;
  followerId: string;
  followingId: string;
}

export default function UserProfile(){  
  const location = useLocation();
  const { user } = location.state as { user: User };
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false); 
  const userId = getUserIdFromToken(localStorage.getItem("accessToken") || "");

  useEffect(() => {
    getAllPostsByUserId(user._id).then((data) => {
      if (data.posts) {
        setPosts(data.posts);
      }
    }).catch((error) => {
      console.error("Error fetching posts:", error);
    });
  }, [user._id, user]);

  const handleClickFollow = () => {
    followUser(user._id).then(() => {
      setIsFollowing(true);
      user.followers_count = user.followers_count ? user.followers_count + 1 : 1;
    }).catch((error) => {
      console.error("Error following user:", error);
    });
  };

  const handleClickUnFollow = () => {
    unfollowUser(user._id).then(() => {
      setIsFollowing(false);
      user.followers_count = user.followers_count ? user.followers_count - 1 : 0;
    }).catch((error) => {
      console.error("Error unfollowing user:", error);
    });
  };
    
  useEffect(() => {
    getAllFollowingByUserId(userId).then((data) => {
        data.following.forEach((follow: Follow) => {
          if (follow.followingId === user._id) {
            setIsFollowing(true);
          }
        });
    }).catch((error) => {
      console.error("Error fetching following:", error);
    });
  }, [userId, user._id]);


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
          {!isFollowing ? (<button className={styles.followButton} onClick={handleClickFollow}>Follow</button>) :
          (<button className={styles.followButton} onClick={handleClickUnFollow}>UnFollow</button>)}

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
          {posts.map((post) => (
            <PostCard key={post._id} post={post} variant="large" />
          ))}
      </div>
    </div>
  );
};
