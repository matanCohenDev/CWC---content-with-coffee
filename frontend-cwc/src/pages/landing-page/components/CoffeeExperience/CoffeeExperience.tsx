"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CoffeeExperienceStyle from "./CoffeeExperience.module.css";
import FeatherSvg from "../../../../assets/svg/Feather.svg";
import HeartSvg from "../../../../assets/svg/Heart.svg";

type Card = {
  id: number;
  name: string;
  designation: string;
  image: string;
  content: string;
};

const items: Card[] = [
  {
    id: 1,
    name: "Fresh Coffee Beans",
    designation: "Premium Selection",
    image: "/src/assets/pics/landingPage-pics/CardStack/CoffeeBeans.jpg",
    content: "Experience the finest, freshly roasted coffee beans for the perfect brew.",
  },
  {
    id: 2,
    name: "Coffee Machines",
    designation: "High-End Brewing",
    image: "/src/assets/pics/landingPage-pics/CardStack/CoffeeMachine.jpg",
    content: "Find the best coffee machines for home and professional use.",
  },
  {
    id: 3,
    name: "Grinding Perfection",
    designation: "Top Coffee Grinders",
    image: "/src/assets/pics/landingPage-pics/CardStack/CoffeeGrinder.jpg",
    content: "Grind your beans to perfection with our selection of top-rated grinders.",
  },
  {
    id: 4,
    name: "Specialty Coffee Recipes",
    designation: "Unique & Delicious",
    image: "/src/assets/pics/landingPage-pics/CardStack/CoffeeCup.jpg",
    content: "Learn how to create the perfect espresso, latte, and specialty drinks.",
  },
];

export const CardStack = ({
  items,
  offset = 15,
  scaleFactor = 0.08,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const [cards, setCards] = useState<Card[]>(items);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard(cards[cards.length - 1]); 
      setTimeout(() => {
        setCards((prevCards: Card[]) => {
          const newArray = [...prevCards];
          newArray.unshift(newArray.pop()!);
          return newArray;
        });
        setActiveCard(null); 
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [cards]);

  return (
    <motion.div
      className={CoffeeExperienceStyle.cardStackContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 1, ease: "easeOut" } },
      }}
    >
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className={CoffeeExperienceStyle.card}
            layout
            initial={{
              opacity: 0,
              x: index % 2 === 0 ? -80 : 80,
              y: index * 20,
              scale: 1.5 - index * 0.05,
              rotate: index % 2 === 0 ? -12 : 12,
            }}
            animate={{
              opacity: activeCard?.id === card.id ? 0 : 1,
              x: 0,
              y: index * -offset,
              scale: 1 - index * scaleFactor,
              rotate: 0,
              zIndex: cards.length - index,
            }}
            exit={{
              opacity: 0,
              y: -50,
              scale: 0.9,
              rotate: index % 2 === 0 ? -10 : 10,
            }}
            transition={{ duration: 1, delay: index * 0.15, ease: "easeInOut" }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <img src={card.image} alt={card.name} className={CoffeeExperienceStyle.cardImage} />
            <div className={CoffeeExperienceStyle.cardContent}>
              <h3>{card.name}</h3>
              <p className={CoffeeExperienceStyle.designation}>{card.designation}</p>
              <p className={CoffeeExperienceStyle.text}>{card.content}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default function CoffeeExperience() {
  return (
    <>
    <motion.div
      className={CoffeeExperienceStyle.coffeeExperienceContainer}
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: false, amount: 0.3 }}
    >
      <motion.img
      src={FeatherSvg}
      alt="Feather"
      className={CoffeeExperienceStyle.featherSvg}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }} 
      transition={{ duration: 1 }}
    />
    <motion.img
      src={HeartSvg}
      alt="Heart"
      className={CoffeeExperienceStyle.heartSvg}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }} 
      transition={{ duration: 1 }}
    />
      <motion.h1
        className={CoffeeExperienceStyle.coffeeExperienceMainTitle}
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
      >
        The Ultimate Coffee Experience
      </motion.h1>

      <motion.div
        className={CoffeeExperienceStyle.coffeeExperienceContentContainerForAll}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.3 }}
      >
        <div className={CoffeeExperienceStyle.coffeeExperienceContentContainer}>
          <CardStack items={items} />
        </div>
        <motion.div
          className={CoffeeExperienceStyle.coffeeExperienceTitleContainer}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h1 className={CoffeeExperienceStyle.coffeeExperienceTitle}>
            Beans, Machines, Recipes, and More!
          </h1>
          <p className={CoffeeExperienceStyle.coffeeExperienceSubtitle}>
            Discover the world of coffee with our premium selection of beans, machines, grinders, and
            recipes. Whether you're a coffee enthusiast or a professional barista, we have everything you
            need to create the perfect brew.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
    </>
  );
}

