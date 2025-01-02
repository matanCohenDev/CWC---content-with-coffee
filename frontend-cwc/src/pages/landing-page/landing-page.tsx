import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import LandingPageStyles from './Landing-page.module.css';

export default function LandingPage() {
    return (
        <div className={LandingPageStyles.headerAndHeroContainer}>
            <div className={LandingPageStyles.headerContainer}>
                <Header />
            </div>
            <div className={LandingPageStyles.heroContainer}>
                <Hero />
            </div>
        </div>
    );
}