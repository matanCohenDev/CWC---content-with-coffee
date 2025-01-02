import HeroStyle from './Hero.module.css';
import SvgContainer from './Svg׳s container/Svg׳sContainer';
import TitleContainer from './Title container/TitleContainer';
import SubTitlesContainer from './SubTitles container/SubTitlesContainer';

export default function Hero() {
    return (
        <div className={HeroStyle.hero_container}>
            <SvgContainer />
            <TitleContainer />
            <SubTitlesContainer />
        </div>
    );
}