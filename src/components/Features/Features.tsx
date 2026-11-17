// src/components/Features/Features.tsx
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Receipt, FileText, ArrowRight } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion';
import { Reveal, Stagger, StaggerItem, SplitHeading, EASE } from '../../motion/kit';
import './Features.css';

/* The three screens of the product, in the order a visitor meets them. */
const steps = [
  {
    icon: PenTool,
    title: 'Trace your roof on the map',
    description:
      'Search your address, then click round the outline of your roof on the satellite view. The area is measured from the shape you draw, in square metres, and the sunlight data is looked up for that exact spot.',
    to: '/calculator',
    cta: 'Open the roof map',
  },
  {
    icon: Receipt,
    title: 'Enter your bill',
    description:
      'Give your monthly electricity bill and how many people live in the house. The average domestic tariff for your state turns the bill into monthly consumption in kWh.',
    to: '/energy-estimation',
    cta: 'Go to the bill step',
  },
  {
    icon: FileText,
    title: 'Read the report',
    description:
      'The system is sized to your yearly use in 500 W units. You get the cost with GST, the subsidy tier, what you pay after it, the payback period, a loan illustration and savings over twenty-five years.',
    to: '/report',
    cta: 'Open the report',
  },
];

/* What the calculator multiplies together. Each line mirrors the code. */
const method = [
  { term: 'Usable roof', formula: 'traced area × 80%' },
  { term: 'Capacity in kW', formula: 'usable roof × 18% panel efficiency × 1 kW/m²' },
  { term: 'Daily energy', formula: 'capacity × average daily irradiance at your roof' },
  { term: 'Tilt angle', formula: 'equal to your latitude' },
];

const numbers = [
  { value: '18', unit: '%', label: 'panel efficiency used for sizing' },
  { value: '12', unit: '%', label: 'GST added to the panel cost' },
  { value: '0.92', unit: 'kg', label: 'of CO₂ avoided per kWh of grid power' },
];

/* ---- Decorative illustrations for the sticky panel ---------------------
   Diagrams of the idea, not screenshots and not map output. */

const draw = (delay = 0) => ({
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: { duration: 1.1, delay, ease: EASE },
});

const RoofArt: React.FC = () => (
  <svg viewBox="0 0 400 400" fill="none" focusable="false">
    {[80, 160, 240, 320].map((p) => (
      <React.Fragment key={p}>
        <line x1={p} y1="20" x2={p} y2="380" className="art-grid" />
        <line x1="20" y1={p} x2="380" y2={p} className="art-grid" />
      </React.Fragment>
    ))}
    <motion.path d="M96 150 L286 112 L318 262 L128 300 Z" className="art-fill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }} />
    <motion.path d="M96 150 L286 112 L318 262 L128 300 Z" className="art-stroke" {...draw(0.1)} />
    {[
      [96, 150],
      [286, 112],
      [318, 262],
      [128, 300],
    ].map(([x, y], i) => (
      <motion.circle
        key={i}
        cx={x}
        cy={y}
        r="8"
        className="art-dot"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.1 + i * 0.26 }}
      />
    ))}
    <text x="207" y="214" className="art-label" textAnchor="middle">
      area in m²
    </text>
  </svg>
);

const BillArt: React.FC = () => (
  <svg viewBox="0 0 400 400" fill="none" focusable="false">
    <motion.path d="M92 60 H248 V330 l-19 -14 -20 14 -19 -14 -20 14 -20 -14 -19 14 -19 -14 -20 14 Z" className="art-stroke art-stroke--soft" {...draw(0)} />
    {[110, 146, 182].map((y, i) => (
      <motion.line key={y} x1="118" y1={y} x2={i === 2 ? 180 : 222} y2={y} className="art-rule" {...draw(0.3 + i * 0.12)} />
    ))}
    <text x="118" y="258" className="art-label art-label--big">₹</text>
    <motion.path d="M262 196 H318" className="art-stroke" {...draw(0.7)} />
    <motion.path d="M306 184 L320 196 L306 208" className="art-stroke" {...draw(0.9)} />
    {[0, 1, 2, 3].map((i) => (
      <motion.rect
        key={i}
        x={300 + i * 20}
        y={300 - (i + 1) * 18}
        width="12"
        height={(i + 1) * 18}
        rx="3"
        className="art-bar"
        style={{ transformBox: 'fill-box', transformOrigin: 'bottom' } as any}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, delay: 1 + i * 0.1, ease: EASE }}
      />
    ))}
    <text x="336" y="330" className="art-label" textAnchor="middle">
      kWh
    </text>
  </svg>
);

const ReportArt: React.FC = () => (
  <svg viewBox="0 0 400 400" fill="none" focusable="false">
    <motion.rect x="70" y="50" width="260" height="300" rx="18" className="art-stroke art-stroke--soft" {...draw(0)} />
    <motion.rect
      x="112" y="120" width="56" height="120" rx="8" className="art-bar"
      style={{ transformBox: 'fill-box', transformOrigin: 'bottom' } as any}
      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
    />
    <motion.rect
      x="188" y="156" width="56" height="84" rx="8" className="art-bar art-bar--teal"
      style={{ transformBox: 'fill-box', transformOrigin: 'bottom' } as any}
      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
    />
    <line x1="100" y1="240" x2="300" y2="240" className="art-rule" />
    {[272, 296, 320].map((y, i) => (
      <motion.line key={y} x1="100" y1={y} x2={i === 1 ? 250 : 300} y2={y} className="art-rule" {...draw(0.8 + i * 0.12)} />
    ))}
    <text x="112" y="96" className="art-label">production · consumption</text>
  </svg>
);

const art = [RoofArt, BillArt, ReportArt];

const Features = () => {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();

  /* The energy line fills as the reader moves down the three steps. */
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 70%', 'end 55%'],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  const Art = art[active];

  return (
    <section id="features" className="home-journey-section">
      <div className="us-container us-section home-journey">
        <header className="home-journey-head">
          <Reveal as="p" className="us-eyebrow" kind="fade">
            How it works
          </Reveal>
          <SplitHeading
            as="h2"
            className="us-h2 home-journey-title"
            text="Three steps from a satellite photo to a costed plan."
            mark={['costed']}
          />
          <Reveal as="p" className="us-lead" delay={0.15}>
            Nothing is guessed at. Every figure in the report comes out of the
            roof you traced, the bill you entered and the tariff for your state.
          </Reveal>
        </header>

        <div className="home-journey-body">
          {/* Sticky on desktop: the picture changes as each step is reached. */}
          <div className="home-journey-stage" aria-hidden="true">
            <div className="home-journey-panel">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="home-journey-art"
                  initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.36, ease: EASE }}
                >
                  <Art />
                </motion.div>
              </AnimatePresence>
              <p className="home-journey-count us-nums">
                <span>{`0${active + 1}`}</span>
                <i />
                <span>03</span>
              </p>
            </div>
          </div>

          <ol className="home-journey-steps" ref={listRef}>
            <li className="home-journey-rail" aria-hidden="true">
              <motion.span style={reduce ? undefined : { scaleY: fill }} />
            </li>
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.title}
                  className={`home-journey-step ${active === index ? 'is-active' : ''}`}
                  onViewportEnter={() => setActive(index)}
                  viewport={{ margin: '-45% 0px -45% 0px' }}
                >
                  <Reveal className="home-journey-step-inner">
                    <span className="home-journey-num us-nums">{`0${index + 1}`}</span>
                    <span className="home-journey-icon" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.75} />
                    </span>
                    <h3 className="us-h3">{step.title}</h3>
                    <p>{step.description}</p>
                    <Link to={step.to} className="us-link home-journey-link">
                      {step.cta}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </Reveal>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* ---- The method, in the open: a bento on the ink band ---- */}
      <div className="us-band us-band--deep us-section home-method">
        <div className="us-container">
          <header className="home-method-head">
            <Reveal as="p" className="us-eyebrow" kind="fade">
              The method
            </Reveal>
            <SplitHeading
              as="h2"
              className="us-h2"
              text="The assumptions behind every estimate, in the open."
            />
          </header>

          <Stagger className="home-method-grid" gap={0.09}>
            <StaggerItem as="article" className="home-method-cell home-method-cell--formula">
              <h3 className="home-method-label">How the sizing is built</h3>
              <dl className="home-method-formulae">
                {method.map((row) => (
                  <div key={row.term}>
                    <dt>{row.term}</dt>
                    <dd>{row.formula}</dd>
                  </div>
                ))}
              </dl>
              <p className="home-method-source">
                Irradiance is the long-term monthly average from NASA POWER for
                the centre of the roof you trace.
              </p>
            </StaggerItem>

            <StaggerItem as="article" className="home-method-cell home-method-cell--hero" kind="scale">
              <p className="us-figure home-method-big">
                80<span className="us-unit us-unit--after">%</span>
              </p>
              <p className="us-figure-caption">
                of your traced roof is treated as usable. The rest is left for
                edges, access and obstructions.
              </p>
              <svg className="home-method-roof" viewBox="0 0 200 120" aria-hidden="true" focusable="false">
                <rect x="4" y="4" width="192" height="112" rx="10" className="roof-outer" />
                <rect x="22" y="20" width="156" height="80" rx="6" className="roof-inner" />
              </svg>
            </StaggerItem>

            {numbers.map((item) => (
              <StaggerItem as="article" key={item.label} className="home-method-cell home-method-cell--stat">
                <p className="us-figure">
                  {item.value}
                  <span className="us-unit us-unit--after">{item.unit}</span>
                </p>
                <p className="us-figure-caption">{item.label}</p>
              </StaggerItem>
            ))}

            <StaggerItem as="article" className="home-method-cell home-method-cell--limits">
              <h3 className="home-method-label">What an estimate cannot see</h3>
              <ul>
                <li>Shade from trees, tanks and neighbouring buildings is not modelled.</li>
                <li>Prices cover the panels by the 500 W unit. Inverter, mounting and installation are quoted by the vendor.</li>
                <li>Subsidy and net metering are summarised from published rules. Your distribution company confirms eligibility.</li>
              </ul>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>
  );
};

export default Features;
