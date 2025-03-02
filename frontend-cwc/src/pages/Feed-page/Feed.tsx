import React, { useState } from "react";
import styles from "./feed.module.css";
import BottomBar from "./components/BottomBar/BottomBar";
import PostCard from "./components/PostCard/PostCard";
import Sidebar from "./components/SideBar/SideBar";
import DecorativeSvgs from "./components/DecorativeSvgs/DecorativeSvgs";
import { Send } from "lucide-react";
import logo from "../../assets/pics/landingPage-pics/logo.png";

const Feed: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

      <PostCard />
      <PostCard />
      <BottomBar />
    </div>
  );
};

export default Feed;
