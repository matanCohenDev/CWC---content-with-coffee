import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import LandingPageStyles from './Landing-page.module.css';
import WhyToJoinUs from "./components/WhyToJoinUs/whyToJoinUs";

export default function LandingPage() {
    return (
        <div className={LandingPageStyles.headerAndHeroContainer}>
            <div className={LandingPageStyles.headerContainer}>
                <Header />
            </div>
            <div className={LandingPageStyles.heroContainer}>
                <Hero />
            </div>
            <div className={LandingPageStyles.whyToJoinUsContainer}>
                <WhyToJoinUs />
            </div>

        </div>
    );
}