import React, { useState, useEffect } from "react";
import styles from "./feed.module.css";
import BottomBar from "./components/BottomBar/BottomBar";
import PostCard from "./components/PostCard/PostCard";
import Sidebar from "./components/SideBar/SideBar";
import DecorativeSvgs from "./components/DecorativeSvgs/DecorativeSvgs";
import { Send } from "lucide-react";
import logo from "../../assets/pics/landingPage-pics/logo.png";
import CoffeeSmartChat from "./components/chatbot/chatbot";
import { getPosts ,logoutUser } from "../../services/apiServices";
import { useNavigate } from "react-router-dom";


const Feed: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const navigate = useNavigate();


  const loadPosts = async () => {
    try {
      const postsArray = await getPosts();
      setPosts(postsArray);
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);
  const handleLogout = async () => {
    try {
      await logoutUser(); 
      localStorage.removeItem("accessToken");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <div className={styles.feedContainer}>
      <DecorativeSvgs />
      <div>
        <img src={logo} alt="logo" className={styles.logo} />
      </div>
      <div className={styles.header}>
        <button
          className={styles.messageButton}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Send size={24} />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className={styles.postsContainer}>
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {/* Pass loadPosts as onPostCreated callback */}
      <BottomBar onPostCreated={loadPosts} />
      <CoffeeSmartChat />
      <button className={styles.logoutButton} onClick={handleLogout}>
        התנתקות
      </button>
    </div>
  );
};

export default Feed;
