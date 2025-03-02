import React, { useState, useEffect } from "react";
import styles from "./uploadPost.module.css";

interface PostUploadProps {
  onClose: () => void;
}

const PostUpload: React.FC<PostUploadProps> = ({ onClose }) => {
  const [postContent, setPostContent] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImages(files);
      setImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handlePost = () => {
    if (!postContent && images.length === 0) {
      alert("You must write something or upload an image.");
      return;
    }

    console.log("Post Data:", { postContent, images });

    onClose();
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
    
        {imagePreviews.length > 0 && (
          <div className={styles.imagePreviewContainer}>
            {imagePreviews.map((preview, index) => (
              <div key={index} className={styles.imagePreviewWrapper}>
                <img src={preview} alt={`Preview ${index}`} className={styles.imagePreview} />
                <button onClick={() => removeImage(index)} className={styles.removeImage}>✖</button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.actionsContainer}>
          <div className={styles.actionsTitle}>Add to your post:</div>
          <div className={styles.actions}>
            <label className={styles.actionIcon} data-tooltip="Upload a photo/video">
              📷
              <input type="file" accept="image/*" multiple onChange={handleImageChange} hidden />
            </label>
            <span className={styles.actionIcon} data-tooltip="Add location">📍</span>
            <span className={styles.actionIcon} data-tooltip="Tag friends">👥</span>
            <span className={styles.actionIcon} data-tooltip="Add a hashtag">#️⃣</span>
            <span className={styles.actionIcon} data-tooltip="Rate your coffee">☕</span>
          </div>
        </div>

        <button className={styles.postButton} onClick={handlePost}>Post</button>
      </div>
    </div>
  );
};

export default PostUpload;
