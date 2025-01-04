import WhyToJoinUsStyle from './whyToJoinUsStyle.module.css';
import ScrollDownArrow from '../../../../assets/svg/ScrollDownArrow.svg';

export default function WhyToJoinUs() {
    const scrollToContent = () => {
        window.scrollTo({ top: 800, behavior: "smooth" });
    };

    return (
        <div className={WhyToJoinUsStyle.container}>
            <div className={WhyToJoinUsStyle.scrollDownContainer} onClick={scrollToContent}>
                <h3 className={WhyToJoinUsStyle.ScrollDown}>scroll down</h3>
                <img src={ScrollDownArrow} alt="scroll down" className={WhyToJoinUsStyle.image}/>
            </div>
            <h1 className={WhyToJoinUsStyle.title}>
                <span style={{ color: "#E4B95B" }}>Why</span> to join us
            </h1>
            <div className={WhyToJoinUsStyle.columnContainer}>
                <div className={WhyToJoinUsStyle.rowContainer}>
                    <div className={WhyToJoinUsStyle.insideContainer}>
                        <h2>✅ <span style={{ color: "#E4B95B" }}>Connect</span> with Coffee Enthusiasts Worldwide! 🌍</h2>
                        <p className={WhyToJoinUsStyle.text}>Meet people who share your love for coffee, from casual drinkers to expert baristas.</p>
                    </div>  
                    <div className={WhyToJoinUsStyle.insideContainer}>
                        <h2>✅ <span style={{ color: "#E4B95B" }}>Discover</span> the Best Coffee Shops! 🏡</h2>
                        <p className={WhyToJoinUsStyle.text}>Find and share hidden coffee gems in your city and beyond.</p>
                    </div>
                    <div className={WhyToJoinUsStyle.insideContainer}>
                        <h2>✅ <span style={{ color: "#E4B95B" }}>Share & Explore</span> Unique Coffee Recipes! 🍵</h2>
                        <p className={WhyToJoinUsStyle.text}>Get inspired by homemade coffee recipes from fellow members.</p>
                    </div>
                </div>
                <div className={WhyToJoinUsStyle.rowContainer}>
                    <div className={WhyToJoinUsStyle.insideContainer}>
                        <h2>✅ <span style={{ color: "#E4B95B" }}>Join</span> Exciting Coffee Discussions! 💬</h2>
                        <p className={WhyToJoinUsStyle.text}>Talk about brewing methods, favorite beans, and the art of making the perfect cup.</p>
                    </div>
                    <div className={WhyToJoinUsStyle.insideContainer}>
                        <h2>✅ Completely Free – Just Pure Coffee Love! 🩶 </h2>
                        <p className={WhyToJoinUsStyle.text}>No fees, no subscriptions – just a welcoming space for coffee lovers like you!</p>
                    </div>
                    <div className={WhyToJoinUsStyle.insideContainer}>
                        <h2>✅ <span style={{ color: "#E4B95B" }}>Find</span> Coffee Events & Meetups! 🎉 </h2>
                        <p className={WhyToJoinUsStyle.text}>Attend local coffee gatherings and connect with fellow coffee lovers in person.</p>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
