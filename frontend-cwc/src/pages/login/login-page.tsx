import React from "react";
import styles from "./login-page.module.css";



const LoginForm: React.FC = () => {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form className={styles.form} onSubmit={handleLogin}>
      <h1>Login</h1>

      <div className={styles.inputBox}>
        <input type="text" placeholder="Username" required />
      </div>

      <div className={styles.inputBox}>
        <input type="password" placeholder="Password" required />
      </div>

      

      <button type="submit" className={`${styles.btn} btn`}>
        Login
      </button>

     
    </form>
  );
};

export default LoginForm;

