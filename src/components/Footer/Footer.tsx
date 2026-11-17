import React from 'react';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookF,
  faTwitter,
  faInstagram,
} from '@fortawesome/free-brands-svg-icons';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="us-container">
        <div className="footer-content" data-reveal-group>
          <div className="footer-section footer-brand">
            <h3>UrjaShakti</h3>
            <p>Empowering homes with solar energy</p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-list">
              <li>
                <a href="/home">Features</a>
              </li>
              <li>
                <a href="/home">About Us</a>
              </li>
              <li>
                <a href="/home">Contact</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Connect</h3>
            <ul className="social-links">
              <li>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FontAwesomeIcon icon={faFacebookF} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <FontAwesomeIcon icon={faTwitter} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagram} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} UrjaShakti. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
