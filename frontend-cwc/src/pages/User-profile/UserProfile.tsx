import styles from "./user-profile.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  followUser,
  getAllFollowingByUserId,
  getUserIdFromToken,
  unfollowUser,
  urlProfilePic,
} from "../../services/apiServices";
import PostCard from "../Feed-page/components/PostCard/PostCard";
import { useState, useEffect } from "react";
import { useFetchUserPosts } from "../../hooks/useFetchUserPosts"; 

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
  profile_pic: string;
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

export default function UserProfile() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = state as { user: User };
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUserId = getUserIdFromToken(localStorage.getItem("accessToken") || "");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, error } = useFetchUserPosts(user._id);
  const posts: Post[] = data?.pages.flatMap((page: any) => page.posts) || [];

  useEffect(() => {
    getAllFollowingByUserId(currentUserId)
      .then((data) => {
        data.following.forEach((follow: Follow) => {
          if (follow.followingId === user._id) {
            setIsFollowing(true);
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching following:", error);
      });
  }, [currentUserId, user._id]);

  const handleClickFollow = () => {
    followUser(user._id)
      .then(() => {
        setIsFollowing(true);
        user.followers_count = user.followers_count ? user.followers_count + 1 : 1;
      })
      .catch((error) => {
        console.error("Error following user:", error);
      });
  };

  const handleClickUnFollow = () => {
    unfollowUser(user._id)
      .then(() => {
        setIsFollowing(false);
        user.followers_count = user.followers_count ? user.followers_count - 1 : 0;
      })
      .catch((error) => {
        console.error("Error unfollowing user:", error);
      });
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <button className={styles.backButton} onClick={() => navigate("/feed")}>
          &larr; Back to Feed
        </button>
        <img src={urlProfilePic(user.profile_pic)} alt="Profile" className={styles.profilePic} />
        <div className={styles.rightSection}>
          <h2 className={styles.profileName}>{user.name}</h2>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{user.followers_count || 0}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{user.following_count || 0}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{user.posts_count || 0}</span>
              <span className={styles.statLabel}>Posts</span>
            </div>
          </div>
          {!isFollowing ? (
            <button className={styles.followButton} onClick={handleClickFollow}>
              Follow
            </button>
          ) : (
            <button className={styles.followButton} onClick={handleClickUnFollow}>
              UnFollow
            </button>
          )}
        </div>
      </div>

      <div className={styles.info}>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Location:</strong> {user.location}
        </p>
        <p>
          <strong>Bio:</strong> {user.bio}
        </p>
        <p>
          <strong>Favorite Coffee:</strong> {user.favorite_coffee}
        </p>
      </div>

      <div className={styles.postsContainer}>
        {error && <p>Error loading posts</p>}
        {posts.length === 0 && !isFetchingNextPage && <p>No posts available</p>}
        {posts.map((post) => (
          <PostCard key={post._id} post={post} variant="large" forceSmallHeight profileId="userProfile" />
        ))}
      </div>

      {isFetchingNextPage && <div className={styles.loader}>Loading more...</div>}

      {hasNextPage && !isFetchingNextPage && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreBtn} onClick={() => fetchNextPage()}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
