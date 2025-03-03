import { useState } from "react";
import { useNavigate } from "react-router-dom";  
import HeaderStyle from "./Header.module.css";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = useNavigate();

    const handleLoginClick = () => {
      navigate("/login"); 
    };

    return (
        <header className={HeaderStyle.header}>
            <div className={HeaderStyle.container}>
                <img
                    src="/src/assets/pics/landingPage-pics/logo.png"
                    alt="logo"
                    className={HeaderStyle.logo}
                />
                
                {/* Navigation Menu */}
                <nav className={`${HeaderStyle.navbar} ${menuOpen ? HeaderStyle.open : ""}`}>
                    <a href="#" className={HeaderStyle.navbarItem}>Home</a>
                    <a href="#" className={HeaderStyle.navbarItem}>About Us</a>
                    <a href="#" className={HeaderStyle.navbarItem}>Services</a>
                    <a href="#" className={HeaderStyle.navbarItem}>Contact Us</a>
                    <a href="#" className={HeaderStyle.navbarItem}>Blog Feed</a>
                </nav>
                
                <div className={HeaderStyle.hanburgerAndLogin}>
                    {/* Login Button */}
                    <div className={HeaderStyle.LogInSignUpContainer}>
                        <button 
                            className={HeaderStyle.userButton}
                            onClick={handleLoginClick}   
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" 
                                 height="24" viewBox="0 0 24 24" fill="none" 
                                 stroke="currentColor" strokeWidth="2" 
                                 strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="7" r="4"></circle>
                                <path d="M5 21v-2a4 4 0 0 1 4-4h6
                                         a4 4 0 0 1 4 4v2"></path>
                            </svg>
                        </button>
                    </div>
                    {/* Hamburger Menu for Mobile */}
                    <div className={HeaderStyle.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
                        <div className={menuOpen ? HeaderStyle.barOpen : HeaderStyle.bar}></div>
                        <div className={menuOpen ? HeaderStyle.barOpen : HeaderStyle.bar}></div>
                        <div className={menuOpen ? HeaderStyle.barOpen : HeaderStyle.bar}></div>
                    </div>
                </div>
            </div>
        </header>
    );
}
