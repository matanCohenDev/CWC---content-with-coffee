import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login-page.module.css';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useGoogleLogin } from '@react-oauth/google';
import { loginUser, fetchUser } from '../../services/apiServices';
import { useUser } from "../../context/UserContext";

type LoginInputs = {
  email: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInputs>();

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    try {
      const result = await loginUser(data.email, data.password, setUser);
      localStorage.setItem("accessToken", result.accessToken);

      const user = await fetchUser();
      if (user) {
        setUser(user);
      }

      console.log("Login success:", result);
      navigate("/feed"); 
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const onGoogleLoginSuccess = async (response: any) => {
    console.log('Google login success:', response);
    navigate("/feed");
  };

  const onGoogleLoginFailure = async () => {
    console.error('Google login failed');
  };

  const login = useGoogleLogin({
    onSuccess: onGoogleLoginSuccess,
    onError: onGoogleLoginFailure,
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h1>Login</h1>

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
      <button type="button" onClick={() => login()} className={styles.btn}>
        Login with Google
      </button>
    </form>
  );
};

export default LoginForm;
