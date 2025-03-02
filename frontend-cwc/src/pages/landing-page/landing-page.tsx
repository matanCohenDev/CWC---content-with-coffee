import CoffeeExperience from "./components/CoffeeExperience/CoffeeExperience";
import ContactUs from "./components/ContactUs/ContactUs";
import Description from "./components/Description/Description";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import LandingPageStyle from "./landing-page.module.css";
import Footer from "./components/Footer/Footer";
import { useUser } from "../../context/UserContext";


export default function LandingPage() {
    const { user } = useUser();
    console.log("User in FormsPage:", user);
    return (
        <div className={LandingPageStyle.landingPage}>
            <Header />
            <Hero />
            {user ? <p>Welcome, {user.name || user.email}!</p> : <p>You are not logged in.</p>}
            <Description />
            <CoffeeExperience />
            <ContactUs />
            <Footer />
        </div>
    );
}