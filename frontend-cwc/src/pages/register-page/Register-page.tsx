import React from "react";
import styles from "./Register-page.module.css";
import { useForm, SubmitHandler } from "react-hook-form";



type FormInputs = {
    name?: string;
    email: string;
    password: string;
    confirmPassword: string;
    bio?: string;
    favorite_coffee?: string;
    location?: string;
  };
  
  const RegisterForm: React.FC = () => {
    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm<FormInputs>();
  
    
    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
            bio: data.bio,
            favorite_coffee: data.favorite_coffee,
            location: data.location,
          }),
        });
  
        if (!response.ok) {
          throw new Error("Registration failed");
        }
  
        const result = await response.json();
        console.log("Registration success:", result);
      } catch (error) {
        console.error("Error:", error);
      }
    };
  
    return (
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1>Registration</h1>
  
        {/* Name (Optional) */}
        <div className={styles.inputBox}>
          <input
            type="text"
            placeholder="Name"
            
            {...register("name")}
          />
          <i className="bx bxs-user"></i>
          {errors.name && <p className={styles.error}>{errors.name.message}</p>}
        </div>
  
        {/* Email (Required) */}
        <div className={styles.inputBox}>
          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
          />
          <i className="bx bxs-envelope"></i>
          {errors.email && (
            <p className={styles.error}>{errors.email.message}</p>
          )}
        </div>
  
        {/* Password (Required) */}
        <div className={styles.inputBox}>
          <input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          <i className="bx bxs-lock-alt"></i>
          {errors.password && (
            <p className={styles.error}>{errors.password.message}</p>
          )}
        </div>
  
        {/* Confirm Password (Required) */}
        <div className={styles.inputBox}>
          <input
            type="password"
            placeholder="Confirm Password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
          />
          <i className="bx bxs-lock-alt"></i>
          {errors.confirmPassword && (
            <p className={styles.error}>{errors.confirmPassword.message}</p>
          )}
        </div>
  
        {/* Bio (Optional) */}
        <div className={styles.inputBox}>
          <input
            type="text"
            placeholder="Bio"
            {...register("bio")}
          />
          <i className="bx bxs-user"></i>
          {errors.bio && <p className={styles.error}>{errors.bio.message}</p>}
        </div>
  
        {/* Favorite Coffee (Optional) */}
        <div className={styles.inputBox}>
          <input
            type="text"
            placeholder="Favorite Coffee"
            {...register("favorite_coffee")}
          />
          <i className="bx bxs-coffee"></i>
          {errors.favorite_coffee && (
            <p className={styles.error}>{errors.favorite_coffee.message}</p>
          )}
        </div>
  
        {/* Location (Optional) */}
        <div className={styles.inputBox}>
          <input
            type="text"
            placeholder="Location"
            {...register("location")}
          />
          <i className="bx bxs-map"></i>
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


