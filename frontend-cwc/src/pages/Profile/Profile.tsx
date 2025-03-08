import styles from "./profile.module.css";
import { useLocation } from "react-router-dom";
import { getAllPostsByUserId, urlProfilePic } from "../../services/apiServices";
import PostCard from "../Feed-page/components/PostCard/PostCard";
import { useState, useEffect } from "react";
import EditPopup from "../../components/Edit-popup"; // ודא שהנתיב נכון

interface User {
  _id: string;
  name: string;
  email: string;
  location: string;
  bio: string;
  favorite_coffee: string;
  profile_pic: string;
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

export default function Profile() {
  const location = useLocation();
  const { user } = location.state as { user: User };
  const [posts, setPosts] = useState<Post[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);

  useEffect(() => {
    getAllPostsByUserId(user._id)
      .then((data) => {
        if (data.posts) {
          setPosts(data.posts);
        }
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, [user._id]);

  const handleOpenEditPopup = () => {
    setShowEditPopup(true);
  };

  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
  };

  const handleSaveProfile = (updatedData: {
    name: string;
    email: string;
    location: string;
    bio: string;
    favoriteCoffee: string;
    profilePicture: File | null;
  }) => {
    console.log("Updated profile data:", updatedData);
    setShowEditPopup(false);
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.profilePicContainer} onClick={() => console.log("Open upload image modal")}>
          <img
            src={urlProfilePic(user?.profile_pic)}
            alt="Profile"
            className={styles.profilePic}
          />
        </div>
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
          <button className={styles.editButton} onClick={handleOpenEditPopup}>
            Edit Profile
          </button>
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
        {Array.isArray(posts) ? (
          posts.map((post) => <PostCard key={post._id} post={post} variant="large" />)
        ) : (
          <p>No posts available</p>
        )}
      </div>

      {showEditPopup && (
        <EditPopup
          onClose={handleCloseEditPopup}
          onSave={handleSaveProfile}
          initialData={{
            name: user.name,
            email: user.email,
            location: user.location,
            bio: user.bio,
            favoriteCoffee: user.favorite_coffee,
            profilePictureUrl: urlProfilePic(user.profile_pic),
          }}
        />
      )}
    </div>
  );
}
