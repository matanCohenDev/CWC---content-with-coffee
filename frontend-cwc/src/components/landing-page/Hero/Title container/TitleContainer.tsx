import HeroTitleStyle from './TitleStyle.module.css';

export default function TitleContainer() {
    return(
        <div className={HeroTitleStyle.hero_title_container}>
            <span className={HeroTitleStyle.hero_line}></span>
                <h1 className={HeroTitleStyle.hero_title}>
                    CWC - content with coffee
                </h1>
            <span className={HeroTitleStyle.hero_line}></span>
        </div>
    );
}