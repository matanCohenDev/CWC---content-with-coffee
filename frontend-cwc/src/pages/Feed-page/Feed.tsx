import React, { useState } from "react";
import styles from "./feed.module.css";
import BottomBar from "./components/BottomBar/BottomBar";
import PostCard from "./components/PostCard/PostCard";
import Sidebar from "./components/SideBar/SideBar";
import DecorativeSvgs from "./components/DecorativeSvgs/DecorativeSvgs";
import { Send } from "lucide-react";
import logo from "../../assets/pics/landingPage-pics/logo.png";
import CoffeeSmartChat from "./components/chatbot/chatbot";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { logoutUser } from "../../services/apiServices";
import { useFetchPosts } from "../../hooks/useFetchPosts";

const Feed: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useUser();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, error, refetch } = useFetchPosts();

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  const handleLogout = async () => {
    try {
      const success = await logoutUser(setUser, setToken);
      if (success) {
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
        window.location.reload();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={styles.feedWrapper}>
      <header className={styles.headerContainer}>
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
      </header>

      <div className={styles.feedContainer}>
        <DecorativeSvgs />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className={styles.postsContainer}>
          {error && <p>Error loading posts</p>}
          {posts.length === 0 && !isFetchingNextPage && <p>No posts available</p>}
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
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

        <BottomBar onPostCreated={refetch} />
        <CoffeeSmartChat />
      </div>

      <button className={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Feed;
