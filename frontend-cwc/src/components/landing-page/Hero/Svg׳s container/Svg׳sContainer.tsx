import HeroSvgContainer from './Svg׳sStyle.module.css'
import CoffeeBean from '../../../../assets/svg/CoffeeBean.svg';
import CoffeeMachine from '../../../../assets/svg/CoffeeMachine.svg';
import CoffeeCup from '../../../../assets/svg/CoffeeCup.svg';

export default function SvgContainer() {
    return (
            <div className={HeroSvgContainer.hero_svg_container}>
                <div className={HeroSvgContainer.svg_and_description_container}>
                    <img src={CoffeeBean} alt='coffeeBean' className={HeroSvgContainer.svg}/>
                    <h3 className={HeroSvgContainer.svg_description}>Bean</h3>
                </div>
                <div className={HeroSvgContainer.svg_and_description_container}>
                    <img src={CoffeeMachine} alt='coffeeMachine' className={HeroSvgContainer.svg}/>
                    <h3 className={HeroSvgContainer.svg_description}>Machine</h3>
                </div>
                <div className={HeroSvgContainer.svg_and_description_container}>
                    <img src={CoffeeCup} alt='coffeeCup' className={HeroSvgContainer.svg}/>
                    <h3 className={HeroSvgContainer.svg_description}>Coffee</h3>
                </div>
            </div>
    );
}
