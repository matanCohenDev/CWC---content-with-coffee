import React from "react";
import styles from "./decorativeSvgs.module.css";
import FeatherSvg from "../../../../assets/svg/Feather.svg";
import HeartSvg from "../../../../assets/svg/Heart.svg";

const DecorativeSvgs: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <img src={FeatherSvg} alt="Feather" className={`${styles.svg} ${styles.feather}`} />
      <img src={HeartSvg} alt="Heart" className={`${styles.svg} ${styles.heart}`} />
    </div>
  );
};

export default DecorativeSvgs;
