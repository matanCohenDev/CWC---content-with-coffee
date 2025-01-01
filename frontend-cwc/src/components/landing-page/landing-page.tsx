import React from 'react';
import styles from './landing-page.module.css';

// ייבוא הקומפוננטות המפורטות
import Header from './Header/Header';
import Hero from './Hero/Hero';
import Features from './Features/Features';
import Community from './Community/Community';
import Contact from './Contact/Contact';
import Footer from './Footer/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className={styles.landingPage}>
      <Header />
      <Hero />
      <Features />
      <Community />
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage;
