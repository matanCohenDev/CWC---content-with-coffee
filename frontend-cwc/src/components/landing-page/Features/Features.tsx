import React from 'react';
import styles from './Features.module.css';

const Features: React.FC = () => {
  return (
    <section id="features" className={styles.features}>
      <h2>מה תקבלו אצלנו?</h2>
      <div className={styles.featuresGrid}>
        <div className={styles.featureBox}>
          <h3>מתכוני קפה</h3>
          <p>גלו מתכונים מיוחדים מכל רחבי העולם, החל מקפוצ'ינו איטלקי ועד קפה מסורתי מיפן.</p>
        </div>
        <div className={styles.featureBox}>
          <h3>קהילה פעילה</h3>
          <p>השתתפו בדיונים, הגיבו לפוסטים ועקבו אחרי חובבי קפה נוספים שיכולים להעשיר את הידע שלכם.</p>
        </div>
        <div className={styles.featureBox}>
          <h3>אירועים וקורסים</h3>
          <p>גילוי והכרה של סדנאות קפה, מפגשים ואירועים מיוחדים לחובבי קפה מכל הסוגים.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
