import React from 'react';
import styles from './feed.module.css'

type Post = {
  id: number;
  username: string;
  avatar: string;
  content: string;
  image: string;
  time: string;
  likes: number;
};

const posts: Post[] = [
  {
    id: 1,
    username: "משתמש_123",
    avatar: "https://via.placeholder.com/50",
    content: "היום ניסיתי קפה אספרסו בבית והתוצאה הייתה מופלאה!",
    image: "https://via.placeholder.com/800x400",
    time: "2 שעות לפני",
    likes: 5,
  },
  {
    id: 2,
    username: "coffee_lover",
    avatar: "https://via.placeholder.com/50",
    content: "קפה קרמל הוא הקפה האהוב עליי – מי עוד אוהב?",
    image: "https://via.placeholder.com/800x400",
    time: "5 שעות לפני",
    likes: 12,
  },
];

const Feed: React.FC = () => {
  return (
    <div className={styles.container}>
      {posts.map(post => (
        <div key={post.id} className={styles.post}>
          <div className={styles.postHeader}>
            <div className={styles.avatar}>
              <img src={post.avatar} alt="Avatar" />
            </div>
            <div className={styles.username}>{post.username}</div>
          </div>
          <div className={styles.postContent}>{post.content}</div>
          <img className={styles.postImage} src={post.image} alt="תמונה של קפה" />
          <div className={styles.postFooter}>
            <div>{post.time}</div>
            <div>{post.likes} לייקים</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;
