import SubTitlesStyle from './SubTitlesStyle.module.css';

export default function SubTitlesContainer() {
    return (
        <section className={SubTitlesStyle.hero}>
                <img src='src/assets/pics/landingPage-pics/leftImage.png' alt='hero-image' className={SubTitlesStyle.hero_image}/>
                <div className={SubTitlesStyle.hero_content}>
                    
                    <p className={SubTitlesStyle.hero_subtitle}>Brewing Connections, One Cup at a Time</p>
                    <p className={SubTitlesStyle.hero_description}>SOCIAL COFFEE LOVERS</p>
                </div>
                <img src='src/assets/pics/landingPage-pics/rightImage.png' alt='hero-image' className={SubTitlesStyle.hero_image}/>
            </section>
    )
}