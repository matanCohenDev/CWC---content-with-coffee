import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>Coffee Lovers</div>
      <nav className={styles.nav}>
        <ul>
          <li><a href="#features">תכונות</a></li>
          <li><a href="#community">קהילה</a></li>
          <li><a href="#contact">צור קשר</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
