import React, { useState } from "react";
import styles from "./editPost.module.css";
import { updatePost, uploadImage } from "../../../../../services/apiServices";

interface EditPostProps {
  postId: string;
  initialContent: string;
  initialImageUrl: string;
  onClose: () => void;
  onSave: (updatedPost: { content: string; imageUrl: string }) => void;
}

export default function EditPost({
  postId,
  initialContent,
  initialImageUrl,
  onClose,
  onSave,
}: EditPostProps) {
  const [content, setContent] = useState(initialContent);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialImageUrl);
  console.log("Initial image URL:", initialImageUrl);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log("Selected image:", file);
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      console.log("Image preview URL:", URL.createObjectURL(file));
    }
  };
  
  const handleSave = async () => {
    try {
      let imageUrl = initialImageUrl;
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const uploadResponse = await uploadImage(formData);
        imageUrl = uploadResponse.substring(15);
      }

      if(imageUrl[0] === 'h'){
        imageUrl = imageUrl.substring(36);
      }

      const postData = {
        content,
        image: imageUrl,
      };
  
      const response = await updatePost(postId, postData);
      console.log("Post updated successfully:", response);
      onSave({
        content,
        imageUrl,
      });
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Error updating post. Please try again.");
    }
  };
  
  return (
    <div className={styles.overlay}>
      <div className={styles.popupContainer}>
        <button className={styles.closeButton} onClick={onClose}>✖</button>
        <h2 className={styles.title}>Edit Post</h2>
        <div className={styles.formGroup}>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className={styles.imageContainer}>
          <img src={imagePreview} alt="Post" className={styles.postImage} />
          <label className={styles.uploadLabel}>
            Change Image
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
          </label>
        </div>
        <button className={styles.saveButton} onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
