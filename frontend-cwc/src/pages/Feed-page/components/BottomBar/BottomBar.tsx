import { useState } from "react";
import bottomBarStyles from "./BottomBar.module.css";
import { User, PlusCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostUpload from "../post-upload/uploadPost";
import SearchComponent from "../SearchComponent/SearchComponent";
import { getUserIdFromToken , getUserNameDatails } from "../../../../services/apiServices";

interface BottomBarProps {
  onPostCreated: () => void;
}

export default function BottomBar({ onPostCreated }: BottomBarProps) {
  const [isShowPostUpload, setIsShowPostUpload] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleClickProfile = () => {
    const userId = getUserIdFromToken(localStorage.getItem("accessToken") || "");
    getUserNameDatails(userId).then((response) => {
      navigate("/profile", { state: { user: response } });
    });
  };

  const handleClickCreatePost = () => {
    setIsShowPostUpload(true);
  };

  const handleClosePostUpload = () => {
    setIsShowPostUpload(false);
  };

  const handleClickSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <div>
      {isShowPostUpload && (
        <PostUpload onClose={handleClosePostUpload} onPostCreated={onPostCreated} />
      )}
      {isSearchOpen && <SearchComponent onClose={handleCloseSearch} />}
      
      <div className={bottomBarStyles.container}>
        <button className={bottomBarStyles.button} onClick={handleClickProfile}>
          <User size={24} />
        </button>
        <button className={bottomBarStyles.button} onClick={handleClickCreatePost}>
          <PlusCircle size={24} />
        </button>
        <button className={bottomBarStyles.button} onClick={handleClickSearch}>
          <Search size={24} />
        </button>
      </div>
    </div>
  );
}
