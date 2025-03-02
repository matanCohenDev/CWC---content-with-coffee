import React, { useState } from "react";
import styles from "./SearchComponent.module.css";
import { X } from "lucide-react";

const users = [
  "Alice Johnson",
  "Bob Smith",
  "Charlie Brown",
  "David Miller",
  "Emma Wilson",
  "Franklin Carter",
  "Grace Davis",
  "Hannah White",
];

interface SearchComponentProps {
  onClose: () => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = users.filter((user) =>
      user.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
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
              filteredUsers.map((user, index) => (
                <li key={index} className={styles.userItem}>
                  {user}
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
