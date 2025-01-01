import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <p>© {new Date().getFullYear()} - Coffee Lovers. כל הזכויות שמורות.</p>
    </footer>
  );
};

export default Footer;
