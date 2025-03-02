import React from "react";
import SideBarStyles from "./Sidebar.module.css";
import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <div className={`${SideBarStyles.sidebar} ${isOpen ? SideBarStyles.open : ""}`}>
      <button className={SideBarStyles.closeButton} onClick={onClose}>
        <X size={24} />
      </button>
      <h2>Chat</h2>
      <ul>
        <li>User 1</li>
        <li>User 2</li>
        <li>User 3</li>
      </ul>
    </div>
  );
};

export default Sidebar;
