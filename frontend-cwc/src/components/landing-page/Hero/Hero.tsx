import React from 'react';
import styles from './Hero.module.css';

const Hero: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>ברוכים הבאים לרשת החברתית של חובבי הקפה</h1>
        <p>
          הצטרפו אלינו, שתפו תמונות, מתכונים וחוויות, והכירו חברים חדשים שמבינים בדיוק מהי האהבה הגדולה שלכם לקפה.
        </p>
        <button className={styles.ctaButton}>התחילו עכשיו</button>
      </div>
    </section>
  );
};

export default Hero;
