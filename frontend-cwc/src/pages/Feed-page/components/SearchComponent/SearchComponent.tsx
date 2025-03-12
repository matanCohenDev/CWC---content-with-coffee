import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./searchComponent.module.css";
import { X } from "lucide-react";
import { getAllUsers , getUserIdFromToken } from "../../../../services/apiServices";

interface User {
  _id: string;
  name: string;
}

interface SearchComponentProps {
  onClose: () => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllUsers()
      .then(response => {
        setUsers(response.data);
        setFilteredUsers(response.data);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
      });
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    const userId = getUserIdFromToken(localStorage.getItem("accessToken") || "");
    setSearchQuery(query);

    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query) && user._id !== userId
    );
    setFilteredUsers(filtered);
  };

  const onHandleClickUser = (user: User) => () => {
    navigate("/userprofile", { state: { user } });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.searchContainer}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        <input
          type="text"
          placeholder="Search for users..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {searchQuery && (
          <ul className={styles.userList}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <li
                  key={user._id}
                  className={styles.userItem}
                  onClick={onHandleClickUser(user)}
                >
                  {user.name}
                </li>
              ))
            ) : (
              <li className={styles.noResults}>No users found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
