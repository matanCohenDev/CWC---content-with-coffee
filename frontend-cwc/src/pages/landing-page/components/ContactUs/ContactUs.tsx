import { useState } from "react";
import styles from "./ContactUs.module.css";
import { motion } from "framer-motion";

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message Sent! ✅");
  };

  return (
    <div className={styles.contactContainerAll}>
      {/* Left Side: Contact Form */}
      <motion.div 
        className={styles.contactFormSection}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>Join Our Coffee-Loving Community!</h1>
        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            className={styles.textarea}
            required
          />
          <button type="submit" className={styles.submitButton}>Submit</button>
        </form>
      </motion.div>

      {/* Right Side: Contact Info & Map */}
      <motion.div 
        className={styles.contactInfoSection}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.mapContainer}>
          <iframe 
            title="Location Map"
            className={styles.map}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13494.9944975217!2d34.76544812844905!3d31.96953721269596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502b401217cf86d%3A0x888cb04d872f8c1b!2z15LXkdeR15og15XXmdeU!5e0!3m2!1siw!2sil!4v1705158587190!5m2!1siw!2sil" 
            allowFullScreen
            loading="lazy"
          />
        </div>

        <div className={styles.contactDetails}>
          <h2>Connect with us</h2>
          <p>📧 Email: <a href="mailto:CWC@gmail.com">CWC@gmail.com</a></p>
          <p>📍 Location: Rishon LeZion, Israel</p>
          <h3>Hours</h3>
          <ul>
            <li>Monday - Friday: 9:00am - 10:00pm</li>
            <li>Saturday: 9:00am - 6:00pm</li>
            <li>Sunday: 9:00am - 12:00pm</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
