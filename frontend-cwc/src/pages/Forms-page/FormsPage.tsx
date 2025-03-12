import React, { useState } from "react";
import LoginForm from "../login-page/login-page";
import RegisterForm from ".././register-page/Register-page";
import styles from "./FormsPage.module.css";
import { useNavigate } from "react-router-dom";




const FormsPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const toggleForm = (registerMode: boolean) => {
    setIsRegister(registerMode);
  };

  return (
    <div className={styles.formsPageWrapper}>
      <button className={styles.backButton} onClick={() => navigate("/")}>
        &larr; Back to Home
      </button>

    <div
      className={`${styles.container} ${
        isRegister ? styles.active : ""
      }`}
    >
      <div className={`${styles.formBox} ${!isRegister ? "" : "hideLogin"}`}>
        {!isRegister && <LoginForm />}
      </div>

      <div
        className={`${styles.formBox} ${styles.register} ${
          isRegister ? "" : "hideRegister"
        }`}
      >
        {isRegister && <RegisterForm setIsRegister={setIsRegister}  />}
      </div>

      <div className={styles.toggleBox}>
        <div className={`${styles.togglePanel} ${styles.toggleLeft}`}>
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account?</p>
          <button
            className={`btn ${styles.btn} registerBtn`}
            onClick={() => toggleForm(true)}
          >
            Register
          </button>
        </div>
        <div className={`${styles.togglePanel} ${styles.toggleRight}`}>
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button
            className={`btn ${styles.btn} loginBtn`}
            onClick={() => toggleForm(false)}
          >
            Login
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default FormsPage;

