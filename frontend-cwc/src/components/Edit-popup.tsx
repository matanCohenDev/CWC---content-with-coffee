import React, { useState } from "react";
import styles from "./edit-popup.module.css";

interface EditPopupProps {
  onClose: () => void; 
  onSave: (updatedData: {
    name: string;
    email: string;
    location: string;
    bio: string;
    favoriteCoffee: string;
    profilePicture: File | null;
  }) => void;
  initialData: {
    name: string;
    email: string;
    location: string;
    bio: string;
    favoriteCoffee: string;
    profilePictureUrl: string; 
  };
}

export default function EditPopup({ onClose, onSave, initialData }: EditPopupProps) {
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const [location, setLocation] = useState(initialData.location);
  const [bio, setBio] = useState(initialData.bio);
  const [favoriteCoffee, setFavoriteCoffee] = useState(initialData.favoriteCoffee);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>(
    initialData.profilePictureUrl
  );

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    onSave({
      name,
      email,
      location,
      bio,
      favoriteCoffee,
      profilePicture,
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popupContainer}>
        <button className={styles.closeButton} onClick={onClose}>✖</button>
        <h2 className={styles.title}>Edit Profile</h2>

        
        <div className={styles.profilePicContainer}>
          <img
            src={profilePicturePreview}
            alt="Profile"
            className={styles.profilePic}
          />
          <label className={styles.uploadLabel}>
            Change Picture
            <input type="file" accept="image/*" onChange={handlePictureChange} hidden />
          </label>
        </div>

        
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        
        <div className={styles.formGroup}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        
        <div className={styles.formGroup}>
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        
        <div className={styles.formGroup}>
          <label htmlFor="favoriteCoffee">Favorite Coffee</label>
          <input
            id="favoriteCoffee"
            type="text"
            value={favoriteCoffee}
            onChange={(e) => setFavoriteCoffee(e.target.value)}
          />
        </div>

        
        <button className={styles.saveButton} onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}
