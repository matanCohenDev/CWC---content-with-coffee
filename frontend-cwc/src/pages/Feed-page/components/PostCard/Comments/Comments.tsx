import React, { useState, useEffect } from "react";
import styles from "./comments.module.css";
import { X, Trash2 } from "lucide-react";
import { 
  getCommentsByPostId, 
  createComment, 
  removeComment, 
  getUserNameDatails 
} from "../../../../../services/apiServices";

interface Comment {
  _id: string;
  userId: string; 
  content: string;
  createdAt: string;
}

interface CommentsProps {
  postId: string;
  onClose: () => void;
}

function CommentItem({ comment, onDelete }: { comment: Comment; onDelete: (id: string) => void }) {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await getUserNameDatails(comment.userId);
        console.log("User details:", data);
        setUsername(data.username || data.name || "Unknown");
      } catch (error) {
        console.error("Error fetching username:", error);
        setUsername("Unknown");
      }
    };
    fetchUserDetails();
  }, [comment.userId]);

  return (
    <li key={comment._id} className={styles.commentItem}>
      <span className={styles.commentUser}>{username}:</span>{" "}
      <span className={styles.commentContent}>{comment.content}</span>
      <button 
        className={styles.deleteButton} 
        onClick={() => onDelete(comment._id)}
        title="Delete Comment"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

export default function Comments({ postId, onClose }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsData = await getCommentsByPostId(postId);
        console.log("Fetched comments:", commentsData);
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [postId]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await createComment(postId, newComment);
        console.log("New comment response:", response);
        setComments([response.data, ...comments]);
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const handleRemoveComment = async (commentId: string) => {
    try {
      await removeComment(commentId, postId);
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (error) {
      console.error("Error removing comment:", error);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.commentContainer}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        <h1 className={styles.title}>Comments</h1>
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={handleCommentChange}
            className={styles.commentInput}
          />
          <button className={styles.addButton} onClick={handleAddComment}>
            Send
          </button>
        </div>
        <ul className={styles.commentList}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onDelete={handleRemoveComment}
              />
            ))
          ) : (
            <li className={styles.noComments}>No comments yet</li>
          )}
        </ul>
      </div>
    </div>
  );
}
