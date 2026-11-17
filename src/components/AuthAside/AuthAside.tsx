import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Stagger, StaggerItem, SplitHeading, EASE } from '../../motion/kit';
import '../../styles/auth.css';

/* The editorial half of the login and signup screens. Presentation only:
   it says what the account is for and holds no state. */

const steps = [
  { n: '01', title: 'Trace your roof', body: 'On a satellite map, in square metres.' },
  { n: '02', title: 'Enter your bill', body: 'Your state tariff turns it into kWh.' },
  { n: '03', title: 'Read the report', body: 'Cost, subsidy, payback and savings.' },
];

const AuthAside: React.FC<{ heading: string }> = ({ heading }) => {
  const reduce = useReducedMotion();

  return (
    <aside className="auth-aside">
      <motion.span
        className="auth-aside-sun"
        aria-hidden="true"
        initial={reduce ? false : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      />
      <svg className="auth-aside-roof" viewBox="0 0 400 160" aria-hidden="true" focusable="false">
        <motion.path
          d="M0 150 L120 60 L200 110 L290 30 L400 120"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
        />
      </svg>

      <div className="auth-aside-body">
        <SplitHeading as="p" className="auth-aside-title" text={heading} inView={false} delay={0.15} />

        <Stagger as="ol" className="auth-aside-steps" inView={false} delay={0.6} gap={0.1}>
          {steps.map((s) => (
            <StaggerItem as="li" key={s.n}>
              <span className="us-nums">{s.n}</span>
              <div>
                <b>{s.title}</b>
                <p>{s.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <p className="auth-aside-note">
        Your roof and bill are saved to your account so the report can be built
        from them.
      </p>
    </aside>
  );
};

export default AuthAside;
