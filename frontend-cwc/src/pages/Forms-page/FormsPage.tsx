import React, { useState } from "react";
import LoginForm from ".././login/login-page";
import RegisterForm from ".././register-page/Register-page";
import styles from "./FormsPage.module.css";




const FormsPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);

  const toggleForm = (registerMode: boolean) => {
    setIsRegister(registerMode);
  };

  return (
    <div className={styles.formsPageWrapper}>

    <div
      className={`${styles.container} ${
        isRegister ? styles.active : ""
      }`}
    >
      {/* The two forms:  Login & Register */}
      <div className={`${styles.formBox} ${!isRegister ? "" : "hideLogin"}`}>
        {/* If we are NOT in register mode, show Login */}
        {!isRegister && <LoginForm />}
      </div>

      <div
        className={`${styles.formBox} ${styles.register} ${
          isRegister ? "" : "hideRegister"
        }`}
      >
        {/* If we are in register mode, show Register */}
        {isRegister && <RegisterForm />}
      </div>

      {/* The big toggler box with panels */}
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

