import React, { useState } from "react";
import styles from "./edit-popup.module.css";
import { updateUser, uploadProfilePic } from "../services/apiServices";

interface EditPopupProps {
  userId: string;
  onClose: () => void; 
  onSave: (updatedData: {
    name: string;
    location: string;
    bio: string;
    favoriteCoffee: string;
    profilePictureUrl: string;
  }) => void;
  initialData: {
    name: string;
    email: string; // still part of initialData if needed elsewhere, but not editable here
    location: string;
    bio: string;
    favoriteCoffee: string;
    profilePictureUrl: string; 
  };
}

export default function EditPopup({ userId, onClose, onSave, initialData }: EditPopupProps) {
  const [name, setName] = useState(initialData.name);
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

  const handleSave = async () => {
    try {
      let profilePictureUrl = initialData.profilePictureUrl;

      if (profilePicture) {
        const formData = new FormData();
        formData.append("image", profilePicture);
        const uploadResponse = await uploadProfilePic(formData);
        profilePictureUrl = uploadResponse;
      }
      if(profilePictureUrl === initialData.profilePictureUrl)
        profilePictureUrl = profilePictureUrl.substring(43);
      else
        profilePictureUrl = profilePictureUrl.substring(22);

      const userData = {
        name: name,
        bio: bio,
        favorite_coffee: favoriteCoffee,
        location: location,
        profile_pic: profilePictureUrl,
      };

      const response = await updateUser(userId, userData);
      console.log("User updated successfully:", response);

      onSave({
        name,
        location,
        bio,
        favoriteCoffee,
        profilePictureUrl,
      });

      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user. Please try again.");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popupContainer}>
        <button className={styles.closeButton} onClick={onClose}>✖</button>
        <h2 className={styles.title}>Edit Profile</h2>

        {/* Profile Picture */}
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

        {/* Name */}
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Location */}
        <div className={styles.formGroup}>
          <label htmlFor="location">Location</label>
          <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        {/* Bio */}
        <div className={styles.formGroup}>
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        {/* Favorite Coffee */}
        <div className={styles.formGroup}>
          <label htmlFor="favoriteCoffee">Favorite Coffee</label>
          <input id="favoriteCoffee" type="text" value={favoriteCoffee} onChange={(e) => setFavoriteCoffee(e.target.value)} />
        </div>

        <button className={styles.saveButton} onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}
