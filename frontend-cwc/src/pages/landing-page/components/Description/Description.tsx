import { motion } from 'framer-motion';
import DescriptionStyle from './Description.module.css';

export default function Description() {
    return (
        <div className={DescriptionStyle.description}>
            <motion.div
                className={DescriptionStyle.textContainer}
                initial={{ opacity: 0, x: -100, scale: 0.9 }} 
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 10, duration: 0.8, delay: 0.2 }}
                viewport={{ once: false }}
            >
                <h1 className={DescriptionStyle.title}>Welcome to CWC – the ultimate hub for coffee lovers! ☕✨</h1>
                <p className={DescriptionStyle.text}>
                    Explore the rich world of coffee, from brewing techniques to expert tips.  
                    Join our community, share your passion, and elevate your coffee experience! 🚀
                </p>
            </motion.div>

            <motion.img
                src="/src/assets/pics/landingPage-pics/CoffeeImage.png"
                alt="Coffee"
                className={DescriptionStyle.image}
                initial={{ opacity: 0, x: 100, scale: 0.9 }} 
                whileInView={{ opacity: 1, x: 0, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 80, damping: 10, duration: 0.8, delay: 0.4 }}
                viewport={{ once: false }}
            />
        </div>
    );
}
