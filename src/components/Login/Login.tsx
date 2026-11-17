// src/components/Login/Login.tsx

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Notification from '../Notification/Notification'; // Import the Notification component
import AuthAside from '../AuthAside/AuthAside';
import { Stagger, StaggerItem } from '../../motion/kit';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: 'error';
  } | null>(null); // State for error notifications

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/home';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    setErrors({ ...errors, [id]: '' });
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
    };

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Authenticate user
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);

        // Fetch additional user data from Firestore
        const userDoc = doc(db, 'users', userCredential.user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          console.log('User Data:', userData);
        }

        // Navigate to the intended route without showing a success notification
        navigate(from, { replace: true });
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          setNotification({ message: 'User not found. Please sign up.', type: 'error' });
        } else if (error.code === 'auth/wrong-password') {
          setNotification({ message: 'Invalid password. Please try again.', type: 'error' });
        } else {
          setNotification({ message: 'Login failed. Please try again.', type: 'error' });
        }
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <div className="auth-page login-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={handleCloseNotification}
        />
      )}
      <div className="auth-shell login-container">
        <AuthAside heading="Welcome back to your roof." />
        <Stagger className="auth-card login-card" inView={false} delay={0.15} gap={0.07}>
          <StaggerItem as="div">
            <h1 className="auth-title login-title">Welcome Back</h1>
            <p className="auth-description login-description">Login to access your solar calculator.</p>
          </StaggerItem>
          <form onSubmit={handleLogin} className="auth-form">
            <StaggerItem className="us-field auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <p id="email-error" className="us-error" role="alert">{errors.email}</p>}
            </StaggerItem>
            <StaggerItem className="us-field auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="********"
                autoComplete="current-password"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && <p id="password-error" className="us-error" role="alert">{errors.password}</p>}
            </StaggerItem>
            <StaggerItem>
              <button type="submit" className="us-btn us-btn--primary us-btn--lg auth-submit login-button">Login</button>
            </StaggerItem>
          </form>
          <StaggerItem as="p" className="auth-footer login-footer">
            Don’t have an account? <Link to="/signup" className="us-link login-footer-link">Sign Up</Link>
          </StaggerItem>
        </Stagger>
      </div>
    </div>
  );
};

export default Login;
