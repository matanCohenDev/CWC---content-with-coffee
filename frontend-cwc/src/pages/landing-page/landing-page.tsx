import CoffeeExperience from "./components/CoffeeExperience/CoffeeExperience";
import ContactUs from "./components/ContactUs/ContactUs";
import Description from "./components/Description/Description";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import LandingPageStyle from "./landing-page.module.css";
import Footer from "./components/Footer/Footer";


export default function LandingPage() {
    return (
        <div className={LandingPageStyle.landingPage}>
            <Header />
            <Hero />
            <Description />
            <CoffeeExperience />
            <ContactUs />
            <Footer />
        </div>
    );
}