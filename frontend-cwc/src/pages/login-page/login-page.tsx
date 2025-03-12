import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login-page.module.css';
import { useForm, SubmitHandler } from 'react-hook-form';
import { loginUser, fetchUser, googleLoginUser } from '../../services/apiServices';
import { useUser } from "../../context/UserContext";
import { GoogleLogin } from '@react-oauth/google';

type LoginInputs = {
  email: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const { setUser, setToken } = useUser();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSuccess = async (credentialResponse: any) => {
    try {
      console.log("credentialResponse:", credentialResponse);
      const token = credentialResponse.credential;
      if (!token) {
        console.error("No token received from Google");
        return;
      }
  
      await googleLoginUser(token, setUser, setToken);
      navigate("/feed");
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
      console.error("Error during Google login:", error);
    }
  };

  const onError = () => {
    console.log('Login Failed');
  };

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInputs>();

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    try {
      const result = await loginUser(data.email, data.password, setUser, setToken);
      localStorage.setItem("accessToken", result.accessToken);
  
      const userData = await fetchUser();
      if (userData) {
        setUser(userData);
      }
  
      navigate("/feed"); 
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
      console.error("Error during login:", error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h1>Login</h1>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      {/* Email */}
      <div className={styles.inputBox}>
        <input
          type="text"
          placeholder="Email"
          {...register('email', { required: 'Email is required' })}
        />
        {errors.email && (
          <p className={styles.error}>{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className={styles.inputBox}>
        <input
          type="password"
          placeholder="Password"
          {...register('password', { required: 'Password is required' })}
        />
        {errors.password && (
          <p className={styles.error}>{errors.password.message}</p>
        )}
      </div>

      <button type="submit" className={styles.btn}>Login</button>
      <GoogleLogin onSuccess={onSuccess} onError={onError} />
    </form>
  );
};

export default LoginForm;
