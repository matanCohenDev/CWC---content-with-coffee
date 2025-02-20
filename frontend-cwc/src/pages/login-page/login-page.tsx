import React from 'react';
import styles from './login-page.module.css';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useGoogleLogin } from '@react-oauth/google';
import { loginUser } from '../../services/apiServices';

type LoginInputs = {
  email: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInputs>();

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    try {
      const result = await loginUser(data.email, data.password);
      console.log('Login success:', result);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const onGoogleLoginSuccess = async (response: any) => {
    console.log('Google login success:', response);
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
      <button onClick={() => login()} className={styles.btn}>
        Login with Google
      </button>
    </form>
  );
};

export default LoginForm;
