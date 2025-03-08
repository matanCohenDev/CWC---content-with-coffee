import React, { useState, useEffect } from "react";
import styles from "./uploadPost.module.css";
import { createPost, uploadImage } from "../../../../services/apiServices";

interface PostUploadProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const PostUpload: React.FC<PostUploadProps> = ({ onClose, onPostCreated }) => {
  const [postContent, setPostContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handlePost = async () => {
    if (!postContent && !image) {
      alert("You must write something or upload an image.");
      return;
    }

    try {
      const response = await uploadImage(image as File, postContent);
      if (!response) {
        throw new Error("Failed to upload image");
      }
      const imageName = response.substring(15);
      await createPost(postContent, imageName);

      onPostCreated();

      onClose(); 
    } catch (error) {
      console.error("Error uploading post:", error);
      alert("Error uploading post. Please try again.");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.uploadContainer}>
        <button onClick={onClose} className={styles.closeButton}>✖</button>
        <h2>Create a Post</h2>

        <div className={styles.postBox}>
          <textarea
            id="postContent"
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </div>

        {imagePreview && (
          <div className={styles.imagePreviewContainer}>
            <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
            <button onClick={removeImage} className={styles.removeImage}>✖</button>
          </div>
        )}

        <div className={styles.actionsContainer}>
          <div className={styles.actionsTitle}>Add an image to your post:</div>
          <div className={styles.actions}>
            <label className={styles.actionIcon} data-tooltip="Upload a photo">
              📷
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>
          </div>
        </div>

        <button className={styles.postButton} onClick={handlePost}>Post</button>
      </div>
    </div>
  );
};

export default PostUpload;
