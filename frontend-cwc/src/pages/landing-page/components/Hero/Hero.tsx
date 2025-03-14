import HeroStyle from './Hero.module.css';
import CoffeeGrinder from '../../../../assets/svg/CoffeeGrinder.svg';
import CoffeeCup from '../../../../assets/svg/CoffeeCup.svg';
import CoffeeBeans from '../../../../assets/svg/CoffeeBean.svg';
import coffeeMachine from '../../../../assets/svg/CoffeeMachine.svg';
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login"); 
  };

  return (
    <div className={HeroStyle.hero}>
      <div className={HeroStyle.heroContainer}>
        <div className={HeroStyle.heroDescription}>
          <h1 className={HeroStyle.title}>Welcome to the CWC</h1>
          <p className={HeroStyle.description}>
            A place where you can learn and share your knowledge with others.
          </p>
          <button onClick={handleLoginClick} className={HeroStyle.button}>
            Get Started
          </button>
        </div>

        <div className={HeroStyle.heroSvgs}>
          <img src={CoffeeGrinder} alt="Coffee Grinder" className={HeroStyle.svg} />
          <img src={CoffeeCup} alt="Coffee Cup" className={HeroStyle.svg} />
          <img src={CoffeeBeans} alt="Coffee Beans" className={HeroStyle.svg} />
          <img src={coffeeMachine} alt="Coffee Machine" className={HeroStyle.svg} />
        </div>
      </div>
    </div>
  );
}
