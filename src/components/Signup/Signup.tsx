// src/components/Signup/Signup.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Notification from '../Notification/Notification'; // Import the Notification component
import AuthAside from '../AuthAside/AuthAside';
import { Stagger, StaggerItem } from '../../motion/kit';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false); // Loading state

  const [notification, setNotification] = useState<{
    message: string;
    type: 'error';
  } | null>(null); // State for error notifications

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    setErrors({ ...errors, [id]: '' });
  };

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true); // Start loading
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Save user data in Firestore
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDocRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          createdAt: serverTimestamp(), // Store the timestamp
        });

        navigate('/login');
      } catch (error: any) {
        console.error('Error during signup:', error);
        if (error.code === 'auth/email-already-in-use') {
          setNotification({
            message:
              'The email address is already in use. Please use a different email or log in.',
            type: 'error',
          });
        } else {
          setNotification({
            message: 'An error occurred during signup. Please try again.',
            type: 'error',
          });
        }
      } finally {
        setLoading(false); // End loading
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <div className="auth-page signup-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={handleCloseNotification}
        />
      )}
      <div className="auth-shell signup-container">
        <AuthAside heading="Three short steps to a costed solar plan." />
        <Stagger className="auth-card signup-card" inView={false} delay={0.15} gap={0.06}>
          <StaggerItem as="div">
            <h1 className="auth-title signup-title">Create an Account</h1>
            <p className="auth-description signup-description">Enter your details to join UrjaShakti.</p>
          </StaggerItem>
          <form onSubmit={handleSignup} className="auth-form">
            <div className="auth-row">
              <StaggerItem className="us-field auth-field">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  autoComplete="given-name"
                  aria-invalid={errors.firstName ? true : undefined}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="us-error" role="alert">{errors.firstName}</p>
                )}
              </StaggerItem>
              <StaggerItem className="us-field auth-field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  autoComplete="family-name"
                  aria-invalid={errors.lastName ? true : undefined}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="us-error" role="alert">{errors.lastName}</p>
                )}
              </StaggerItem>
            </div>
            <StaggerItem className="us-field auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@example.com"
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
                autoComplete="new-password"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? 'password-error' : 'password-help'}
              />
              {errors.password ? (
                <p id="password-error" className="us-error" role="alert">{errors.password}</p>
              ) : (
                <p id="password-help" className="us-help">At least 6 characters.</p>
              )}
            </StaggerItem>
            <StaggerItem>
              <button
                type="submit"
                className="us-btn us-btn--primary us-btn--lg auth-submit signup-button"
                disabled={loading}
              >
                {loading && <span className="auth-spinner" aria-hidden="true" />}
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </StaggerItem>
          </form>
          <StaggerItem as="p" className="auth-footer signup-footer">
            Already have an account?{' '}
            <Link to="/login" className="us-link signup-footer-link">
              Login
            </Link>
          </StaggerItem>
        </Stagger>
      </div>
    </div>
  );
};

export default Signup;
