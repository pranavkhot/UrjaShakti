// src/components/Welcome/Welcome.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Reveal,
  Stagger,
  StaggerItem,
  SplitHeading,
  MaskReveal,
  Parallax,
  EASE,
} from '../../motion/kit';
import './Welcome.css';

/*
  The figures on the example card are worked through the same constants the
  calculator uses: 80% usable roof, 18% panel efficiency, 500 W units,
  12% GST, and the rooftop subsidy capped at Rs 78,000 at 3 kW.
  A 24 m2 roof gives 19.2 m2 usable, a 3.46 kW system, 7 units at Rs 17,500,
  Rs 137,200 with GST, Rs 59,200 after the subsidy.
*/

const Welcome: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <section className="home-hero">
      {/* Decorative: the sun the whole page is lit by. */}
      <motion.span
        className="home-hero-sun"
        aria-hidden="true"
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      />

      <div className="home-hero-grid us-container">
        <div className="home-hero-copy">
          <Reveal as="p" className="us-eyebrow" kind="fade" inView={false} duration={0.5}>
            Rooftop solar for Indian homes
          </Reveal>

          <SplitHeading
            as="h1"
            className="us-h1 home-hero-title"
            text="Find out what solar will save on your roof."
            mark={['save']}
            delay={0.1}
            inView={false}
          />

          <Reveal as="p" className="us-lead home-hero-lead" inView={false} delay={0.5}>
            Trace your roof on a satellite map and enter your electricity bill.
            UrjaShakti sizes the system, applies the subsidy tiers and shows
            what you pay and what you get back, year by year.
          </Reveal>

          <Stagger className="home-hero-actions" inView={false} delay={0.65} gap={0.08}>
            <StaggerItem>
              <Link to="/calculator" className="us-btn us-btn--primary us-btn--lg">
                Start your estimate
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </StaggerItem>
            <StaggerItem>
              <HashLink smooth to="/#features" className="us-btn us-btn--secondary us-btn--lg">
                See how it works
              </HashLink>
            </StaggerItem>
          </Stagger>

          <Stagger as="dl" className="home-hero-facts us-nums" inView={false} delay={0.85} gap={0.08}>
            <StaggerItem className="home-hero-fact">
              <dt>Subsidy applied</dt>
              <dd>
                up to <span className="us-unit us-unit--before">&#8377;</span>78,000
              </dd>
            </StaggerItem>
            <StaggerItem className="home-hero-fact">
              <dt>Savings projected over</dt>
              <dd>
                25 <span className="us-unit us-unit--after">years</span>
              </dd>
            </StaggerItem>
            <StaggerItem className="home-hero-fact">
              <dt>Tariffs and net metering</dt>
              <dd>state by state</dd>
            </StaggerItem>
          </Stagger>
        </div>

        {/* A picture window onto a real roof, with the traced outline the
            calculator asks for drawn over it, and an example result floating
            in front. Glass is justified: the photograph is really behind it. */}
        <figure className="home-hero-visual">
          <Parallax distance={26}>
            <MaskReveal className="home-hero-window" inView={false} delay={0.2}>
              <img
                src="/images/house-1600.jpg"
                alt="A pitched house roof covered edge to edge with solar panels"
                width={1600}
                height={1989}
              />
              <svg
                className="home-hero-trace"
                viewBox="0 0 520 647"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
                focusable="false"
              >
                <motion.polygon
                  points="52,290 438,260 380,424 92,440"
                  initial={reduce ? false : { pathLength: 0, fillOpacity: 0 }}
                  animate={{ pathLength: 1, fillOpacity: 0.16 }}
                  transition={{
                    pathLength: { duration: 1.5, delay: 1.2, ease: EASE },
                    fillOpacity: { duration: 0.6, delay: 2.5 },
                  }}
                />
                {[
                  [52, 290],
                  [438, 260],
                  [380, 424],
                  [92, 440],
                ].map(([cx, cy], i) => (
                  <motion.circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="6"
                    initial={reduce ? false : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 1.2 + i * 0.36 }}
                  />
                ))}
              </svg>
            </MaskReveal>
          </Parallax>

          <motion.figcaption
            className="home-hero-card us-glass"
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
          >
            <p className="home-hero-card-label">
              <span className="us-chip us-chip--amber">Example estimate</span>
            </p>
            <ul className="home-hero-card-list us-nums">
              <li>
                <span>Roof traced</span>
                <b>
                  24 <span className="us-unit us-unit--after">m&sup2;</span>
                </b>
              </li>
              <li>
                <span>Usable roof at 80%</span>
                <b>
                  19.2 <span className="us-unit us-unit--after">m&sup2;</span>
                </b>
              </li>
              <li>
                <span>System size</span>
                <b>
                  3.46 <span className="us-unit us-unit--after">kW</span>
                </b>
              </li>
              <li>
                <span>500 W units</span>
                <b>7</b>
              </li>
            </ul>
            <div className="home-hero-card-total">
              <span>Cost after subsidy</span>
              <strong className="us-figure us-figure--inline us-figure--money">
                <span className="us-unit us-unit--before">&#8377;</span>
                <span>59,200</span>
              </strong>
              <small>&#8377;1,37,200 with GST, less the &#8377;78,000 subsidy</small>
            </div>
          </motion.figcaption>
        </figure>
      </div>
    </section>
  );
};

export default Welcome;
