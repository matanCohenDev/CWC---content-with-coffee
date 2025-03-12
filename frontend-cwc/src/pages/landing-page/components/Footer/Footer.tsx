import styles from "./Footer.module.css";
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaGoogle } from "react-icons/fa";
import logo from "../../../../assets/pics/landingPage-pics/logo.png";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        <div className={styles.footerSection}>
          <img src={logo} alt="Despina Logo" className={styles.logo} />
          <h3 className={styles.description}>
            We have a hankering for some really good melt-in-the-mouth variety. 
            Floury is the best choice to taste food and dessert.
          </h3>
          <div className={styles.socialIcons}>
            <FaFacebookF />
            <FaTwitter />
            <FaInstagram />
            <FaPinterest />
            <FaGoogle />
          </div>
        </div>

        <div className={styles.footerSection}>
          <div className={styles.footerTitle}>
            <h2>Contact</h2>
            <h4>Israel</h4>
            <h4>Eli Vizel 2, Rishon Letzion</h4>
            <h4>📞 052-538-1648</h4>
            <h4>📧 <a href="CWC@gmail.com">CWC@gmail.com</a></h4>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>Copyright © 2025 Hire WordPress Developer. All rights reserved.</p>
      </div>
    </footer>
  );
}
