import React from "react";
import SideBarStyles from "./sideBar.module.css";
import { X } from "lucide-react";
import { getAllUsers, getUserIdFromToken } from "../../../../services/apiServices";
import Chat from "./Chat/Chat";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  _id: string;
  name: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [showChat, setShowChat] = React.useState<boolean>(false);
  const [chatUserName, setChatUserName] = React.useState<string | null>(null);
  const [chatUserId, setChatUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAllUsers().then((response) => {
      setUsers(response.data);
    });
  }, []);

  React.useEffect(() => {
    const userId = getUserIdFromToken(localStorage.getItem("accessToken") || "");
    const filtered = users.filter((user: User) => user._id !== userId);
    setFilteredUsers(filtered);
  }, [users]);

  const handleUserClick = (user: User) => {
    setChatUserName(user.name);
    setChatUserId(user._id);
    setShowChat(true);
    onClose();
  };

  return (
    <div>
      <div className={`${SideBarStyles.sidebar} ${isOpen ? SideBarStyles.open : ""}`}>
        <button className={SideBarStyles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className={SideBarStyles.title}>Chat</h2>
        <ul className={SideBarStyles.userList}>
          {filteredUsers.map((user: User) => (
            <li
              key={user._id}
              className={SideBarStyles.userItem}
              onClick={() => handleUserClick(user)}
            >
              {user.name}
            </li>
          ))}
        </ul>
      </div>
      {showChat && chatUserId && chatUserName && !isOpen && <Chat name={chatUserName} _id={chatUserId} onclose={() => setShowChat(false)}/>}
        
    </div>
  );
};

export default Sidebar;
