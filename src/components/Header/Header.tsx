import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { motion } from 'framer-motion';
import { Menu, X, User } from 'react-feather';
import { auth } from '../../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import './Header.css';

/* The active indicator: one shared element that slides between links.
   Presentation only; it reads the current location and changes nothing. */
const NavPill: React.FC = () => (
  <motion.span
    layoutId="nav-pill"
    className="nav-pill"
    aria-hidden="true"
    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
  />
);

const Header: React.FC = () => {
  const location = useLocation();
  const onHome = location.pathname === '/';
  const at = (hash: string) => onHome && location.hash === hash;
  const atCalculator = location.pathname === '/calculator';

  const [navActive, setNavActive] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  const toggleNav = () => setNavActive(!navActive);
  const closeNav = () => setNavActive(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  /* The bar gains its shadow after 8px, and steps out of the way when the
     reader is moving down the page. Presentation only. */
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (!reduce) {
        setHidden(y > 160 && y > lastY.current);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* A menu that is open should close on Escape. */
  useEffect(() => {
    if (!navActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavActive(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navActive]);

  const scrollWithOffset = (el: HTMLElement) => {
    const yOffset = -80; // Adjust for header height
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const barClass = [
    'header',
    scrolled ? 'is-scrolled' : '',
    hidden && !navActive ? 'is-hidden' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={barClass}>
      <div className="header-inner us-container">
        <nav className={`nav ${navActive ? 'active' : ''}`} aria-label="Main">
          {/* Left Section - Logo */}
          <div className="logo">
            <Link to={user ? '/home' : '/'}>UrjaShakti</Link>
          </div>

          {/* Center Section - Navigation Links */}
          <ul className="nav-links">
            <li>
              {at('#features') && <NavPill />}
              <HashLink
                smooth
                to="/#features"
                scroll={(el) => scrollWithOffset(el)}
                onClick={closeNav}
                aria-current={at('#features') ? 'location' : undefined}
              >
                Features
              </HashLink>
            </li>
            <li>
              {at('#services') && <NavPill />}
              <HashLink
                smooth
                to="/#services"
                scroll={(el) => scrollWithOffset(el)}
                onClick={closeNav}
                aria-current={at('#services') ? 'location' : undefined}
              >
                Services
              </HashLink>
            </li>
            <li>
              {at('#about') && <NavPill />}
              <HashLink
                smooth
                to="/#about"
                scroll={(el) => scrollWithOffset(el)}
                onClick={closeNav}
                aria-current={at('#about') ? 'location' : undefined}
              >
                About
              </HashLink>
            </li>
            {user && (
              <li>
                {atCalculator && <NavPill />}
                <Link
                  to="/rwh-eligi"
                  onClick={closeNav}
                  aria-current={atCalculator ? 'page' : undefined}
                >
                  Calculator
                </Link>
              </li>
            )}
          </ul>

          {/* Right Section - Auth Buttons or User Icon */}
          <div className="auth-section">
            {user ? (
              <Link to="/dashboard" className="user-icon" aria-label="Your account">
                <User size={20} aria-hidden="true" />
              </Link>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-link">
                  Log in
                </Link>
                <Link to="/signup" className="us-btn us-btn--primary signup-link">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu */}
          <button
            className="nav-toggle"
            onClick={toggleNav}
            aria-expanded={navActive}
            aria-controls="mobile-menu"
            aria-label={navActive ? 'Close menu' : 'Open menu'}
          >
            {navActive ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <ul id="mobile-menu" className={`nav-mobile ${navActive ? 'show' : ''}`}>
        <li>
          <HashLink smooth to="/#features" scroll={(el) => scrollWithOffset(el)} onClick={closeNav}>
            Features
          </HashLink>
        </li>
        <li>
          <HashLink smooth to="/#services" scroll={(el) => scrollWithOffset(el)} onClick={closeNav}>
            Services
          </HashLink>
        </li>
        <li>
          <HashLink smooth to="/#about" scroll={(el) => scrollWithOffset(el)} onClick={closeNav}>
            About
          </HashLink>
        </li>
        {user ? (
          <>
            <li>
              <Link to="/calculator" onClick={closeNav}>
                Calculator
              </Link>
            </li>
            <li>
              <Link to="/dashboard" onClick={closeNav}>
                Dashboard
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" onClick={closeNav}>
                Log in
              </Link>
            </li>
            <li className="nav-mobile-cta">
              <Link to="/signup" className="us-btn us-btn--primary" onClick={closeNav}>
                Sign up
              </Link>
            </li>
          </>
        )}
      </ul>
    </header>
  );
};

export default Header;
