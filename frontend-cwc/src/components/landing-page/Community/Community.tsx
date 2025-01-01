import React from 'react';
import styles from './Community.module.css';

const Community: React.FC = () => {
  return (
    <section id="community" className={styles.community}>
      <h2>קהילת הקפה שלנו</h2>
      <p>הצטרפו לאלפי משתמשים שכבר נהנים מקפה איכותי ומחברים לדרך.</p>
      <button className={styles.ctaButton}>הצטרפו עכשיו</button>
    </section>
  );
};

export default Community;
