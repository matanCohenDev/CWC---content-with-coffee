import React from 'react';
import styles from './Register-page.module.css';
import { useForm, SubmitHandler } from 'react-hook-form';
import { registerUser } from '../../services/apiServices';

type FormInputs = {
  name?: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio?: string;
  favorite_coffee?: string;
  location?: string;
};
type RegisterFormProps = {
  setIsRegister: React.Dispatch<React.SetStateAction<boolean>>;
};

const RegisterForm: React.FC<RegisterFormProps> = ({ setIsRegister }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    const userData = {
      name: data.name,
      email: data.email,
      password: data.password,
      bio: data.bio,
      favorite_coffee: data.favorite_coffee,
      location: data.location,
    };

    try {
      const result = await registerUser(userData);
      console.log('Registration success:', result);
      alert('Registration successful! Please log in.');
      setIsRegister(false);

    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h1>Registration</h1>

      <div className={styles.inputBox}>
        <input
          type="text"
          placeholder="Full Name"
          {...register('name')}
        />
        {errors.name && <p className={styles.error}>{errors.name.message}</p>}
      </div>

      <div className={styles.inputBox}>
        <input
          type="email"
          placeholder="Email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && (
          <p className={styles.error}>{errors.email.message}</p>
        )}
      </div>

      <div className={styles.inputBox}>
        <input
          type="password"
          placeholder="Password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />
        {errors.password && (
          <p className={styles.error}>{errors.password.message}</p>
        )}
      </div>

      <div className={styles.inputBox}>
        <input
          type="password"
          placeholder="Confirm Password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === watch('password') || 'Passwords do not match',
          })}
        />
        {errors.confirmPassword && (
          <p className={styles.error}>{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className={styles.inputBox}>
        <input
          type="text"
          placeholder="Bio"
          {...register('bio')}
        />
        {errors.bio && <p className={styles.error}>{errors.bio.message}</p>}
      </div>

      <div className={styles.inputBox}>
        <input
          type="text"
          placeholder="Favorite Coffee"
          {...register('favorite_coffee')}
        />
        {errors.favorite_coffee && (
          <p className={styles.error}>{errors.favorite_coffee.message}</p>
        )}
      </div>

      <div className={styles.inputBox}>
        <input
          type="text"
          placeholder="Location"
          {...register('location')}
        />
        {errors.location && (
          <p className={styles.error}>{errors.location.message}</p>
        )}
      </div>

      <button type="submit" className={`${styles.btn} btn`}>
        Register
      </button>
    </form>
  );
};

export default RegisterForm;
