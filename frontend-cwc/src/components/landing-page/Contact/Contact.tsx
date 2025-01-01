import React from 'react';
import styles from './Contact.module.css';

const Contact: React.FC = () => {
  return (
    <section id="contact" className={styles.contact}>
      <h2>רוצים ליצור איתנו קשר?</h2>
      <p>שלחו לנו הודעה ונחזור אליכם בהקדם!</p>
      <form className={styles.contactForm}>
        <input type="text" placeholder="שם מלא" />
        <input type="email" placeholder="כתובת אימייל" />
        <textarea placeholder="הודעה"></textarea>
        <button type="submit" className={styles.ctaButton}>שליחה</button>
      </form>
    </section>
  );
};

export default Contact;
