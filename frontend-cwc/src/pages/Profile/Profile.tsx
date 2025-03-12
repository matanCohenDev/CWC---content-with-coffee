import styles from "./profile.module.css";
import { useLocation } from "react-router-dom";
import { getAllPostsByUserId, urlProfilePic } from "../../services/apiServices";
import PostCard from "../Feed-page/components/PostCard/PostCard";
import { useState, useEffect } from "react";
import EditPopup from "../../components/Edit-popup";
import { useNavigate } from "react-router-dom";


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
  const navigate = useNavigate();
  const location = useLocation();
  const { user: initialUser } = location.state as { user: User };
  const [userData, setUserData] = useState<User>(initialUser);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);

  useEffect(() => {
    getAllPostsByUserId(userData._id)
      .then((data) => {
        if (data.posts) {
          setPosts(data.posts);
        }
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, [userData._id]);

  const handleOpenEditPopup = () => {
    setShowEditPopup(true);
  };

  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
  };

  const handleSaveProfile = (updatedData: {
    name: string;
    location: string;
    bio: string;
    favoriteCoffee: string;
    profilePictureUrl: string;
  }) => {
    setUserData((prevUser) => ({
      ...prevUser,
      name: updatedData.name,
      location: updatedData.location,
      bio: updatedData.bio,
      favorite_coffee: updatedData.favoriteCoffee,
      profile_pic: updatedData.profilePictureUrl,
    }));
    setShowEditPopup(false);
  };

  return (
    <div className={styles.profileContainer}>
      <button className={styles.backButton} onClick={() => navigate("/feed")}>
        &larr; Back to Feed
      </button>
      <div className={styles.profileHeader}>
      
        <div className={styles.profilePicContainer} onClick={() => console.log("Open upload image modal")}>
          <img
            src={urlProfilePic(userData.profile_pic)}
            alt="Profile"
            className={styles.profilePic}
          />
        </div>
        <div className={styles.rightSection}>
          <h2 className={styles.profileName}>{userData.name}</h2>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userData.followers_count || 0}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userData.following_count || 0}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userData.posts_count || 0}</span>
              <span className={styles.statLabel}>Posts</span>
            </div>
          </div>
          <button className={styles.editButton} onClick={handleOpenEditPopup}>
            Edit Profile
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Location:</strong> {userData.location}</p>
        <p><strong>Bio:</strong> {userData.bio}</p>
        <p><strong>Favorite Coffee:</strong> {userData.favorite_coffee}</p>
      </div>

      <div className={styles.postsContainer}>
        {Array.isArray(posts) ? (
          posts.map((post) => <PostCard key={post._id} post={post} variant="large" profileId="profile" />)
        ) : (
          <p>No posts available</p>
        )}
      </div>

      {showEditPopup && (
        <EditPopup
          userId={userData._id}
          onClose={handleCloseEditPopup}
          onSave={handleSaveProfile}
          initialData={{
            name: userData.name,
            email: userData.email,
            location: userData.location,
            bio: userData.bio,
            favoriteCoffee: userData.favorite_coffee,
            profilePictureUrl: urlProfilePic(userData.profile_pic),
          }}
        />
      )}
    </div>
  );
}
