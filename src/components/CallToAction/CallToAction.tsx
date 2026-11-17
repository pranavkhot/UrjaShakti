import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal, SplitHeading, EASE } from '../../motion/kit';
import './CallToAction.css';

const RAYS = Array.from({ length: 9 });

const CallToAction = () => {
  const reduce = useReducedMotion();

  return (
    <section className="home-cta us-band us-band--accent us-section us-section--tight">
      {/* Decorative: rays fanning out from a sun on the band's lower edge. */}
      <svg className="home-cta-rays" viewBox="0 0 600 300" aria-hidden="true" focusable="false">
        {RAYS.map((_, i) => {
          const angle = (-160 + i * 17.5) * (Math.PI / 180);
          const x1 = 300 + Math.cos(angle) * 110;
          const y1 = 300 + Math.sin(angle) * 110;
          const x2 = 300 + Math.cos(angle) * 280;
          const y2 = 300 + Math.sin(angle) * 280;
          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.06, ease: EASE }}
            />
          );
        })}
        <circle cx="300" cy="300" r="84" />
      </svg>

      <div className="us-container home-cta-inner">
        <div className="home-cta-copy">
          <SplitHeading
            as="h2"
            className="us-h2 home-cta-title"
            text="Start with your roof. The rest follows from it."
          />
          <Reveal as="p" className="us-lead home-cta-lead" delay={0.2}>
            Trace the outline, enter last month&rsquo;s bill, and read what solar
            would cost you and give back.
          </Reveal>
        </div>
        <Reveal kind="scale" delay={0.3}>
          <a href="/calculator" className="us-btn us-btn--ink us-btn--lg home-cta-button">
            Start your estimate
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export default CallToAction;
