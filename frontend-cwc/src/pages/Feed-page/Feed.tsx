import React, { useState, useEffect } from "react";
import styles from "./feed.module.css";
import BottomBar from "./components/BottomBar/BottomBar";
import PostCard from "./components/PostCard/PostCard";
import Sidebar from "./components/SideBar/SideBar";
import DecorativeSvgs from "./components/DecorativeSvgs/DecorativeSvgs";
import { Send } from "lucide-react";
import logo from "../../assets/pics/landingPage-pics/logo.png";
import CoffeeSmartChat from "./components/chatbot/chatbot"; 
import { getPosts } from "../../services/apiServices";

const Feed: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  const loadPosts = async () => {
    try {
      const postsArray = await getPosts();
      setPosts(postsArray);
      console.log("Posts:", postsArray);
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

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
    </div>
  );
};

export default Feed;
