// src/components/About/About.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Reveal,
  Stagger,
  StaggerItem,
  SplitHeading,
  MaskReveal,
  Parallax,
  EASE,
} from '../../motion/kit';
import './About.css';

/* Tariff rates come from src/data/indianTariffRates.ts. The bar is the rate
   to scale against ₹8 per kWh. */
const tariffs = [
  { state: 'Maharashtra', rate: '7.76' },
  { state: 'West Bengal', rate: '6.89' },
  { state: 'Tamil Nadu', rate: '6.50' },
  { state: 'Andhra Pradesh', rate: '5.97' },
  { state: 'Delhi', rate: '5.80' },
];

/* Practical questions. Every answer describes what the product does today. */
const faqs = [
  {
    q: 'How is my roof area measured?',
    a: 'You click round the outline of your roof on the satellite map. The area of that shape is computed on the map itself, in square metres. You can drag the corners afterwards and the figures update.',
  },
  {
    q: 'Where does the sunlight data come from?',
    a: 'From NASA POWER, a public dataset of long-term solar irradiance. UrjaShakti looks up the monthly averages for the centre of your roof and uses their yearly mean, in kWh per square metre per day.',
  },
  {
    q: 'How close is the estimate to a real quotation?',
    a: 'It is a planning figure. It assumes 80% of the roof is usable and 18% panel efficiency, and it does not model shade. Prices cover the panels by the 500 W unit; an installer will add the inverter, mounting and labour after a site visit.',
  },
  {
    q: 'How is the subsidy worked out?',
    a: 'From the size of the system: ₹30,000 per kW up to 2 kW, ₹18,000 for each kW between 2 and 3, and a cap of ₹78,000 at 3 kW and above. Whether you receive it is decided by the scheme and your distribution company, not by this estimate.',
  },
  {
    q: 'What does the loan illustration assume?',
    a: 'A 20% down payment on the cost after subsidy, with the rest financed at 8.5% a year over 10 years. It shows the monthly EMI beside your bill before and after solar, so you can see the net monthly effect.',
  },
  {
    q: 'Do I need an account?',
    a: 'Yes. Your traced roof and your bill are saved to your account so the report can be built from them. Signing up takes a name, an email address and a password.',
  },
  {
    q: 'Can I keep the report?',
    a: 'The report page has a download button that saves it as a PDF, and a link through to the partner vendors.',
  },
];

const About: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <>
      <section id="about" className="home-about">
        <div className="us-container us-section home-about-top">
          <header className="home-about-intro">
            <Reveal as="p" className="us-eyebrow" kind="fade">
              About UrjaShakti
            </Reveal>
            <SplitHeading
              as="h2"
              className="us-h2 home-about-title"
              text="Solar decisions are made on numbers. We make the numbers easy to get."
              mark={['numbers.']}
            />
          </header>

          <Stagger className="home-about-grid" gap={0.1}>
            <StaggerItem as="article" className="home-about-item">
              <h3 className="us-h3">Our mission</h3>
              <p>
                To accelerate the global transition to sustainable energy by
                making solar power accessible, affordable, and simple for
                everyone.
              </p>
            </StaggerItem>

            <StaggerItem as="article" className="home-about-item">
              <h3 className="us-h3">Our vision</h3>
              <p>
                A world where clean, renewable energy powers every home and
                business, creating a sustainable future for generations to come.
              </p>
            </StaggerItem>

            <StaggerItem as="article" className="home-about-item">
              <h3 className="us-h3">Our values</h3>
              <ul className="home-about-values">
                {['Innovation', 'Sustainability', 'Accessibility', 'Integrity'].map((value) => (
                  <li key={value} className="us-chip">
                    {value}
                  </li>
                ))}
              </ul>
            </StaggerItem>
          </Stagger>
        </div>

        {/* ---- Coverage ---- */}
        <div className="us-band us-band--sunken us-section home-coverage">
          <div className="us-container home-coverage-inner">
            <Parallax distance={22} className="home-coverage-figure">
              <MaskReveal className="home-coverage-image" radius={28}>
                <img
                  src="/images/cal_hero-1600.jpg"
                  alt="Rows of ground-mounted solar panels under a wide blue sky"
                  width={1600}
                  height={1065}
                  loading="lazy"
                />
              </MaskReveal>
            </Parallax>

            <div className="home-coverage-copy">
              <Reveal as="p" className="us-eyebrow" kind="fade">
                Where it works
              </Reveal>
              <SplitHeading
                as="h3"
                className="us-h2 home-coverage-title"
                text="Your state’s tariff and net metering rules are built in."
              />
              <Reveal as="p" className="us-lead" delay={0.15}>
                Savings are only as good as the rate you are actually paying.
                UrjaShakti holds the average domestic tariff for each state and
                the net metering summary that goes with it: the system size
                limit, the settlement period, and which charges you are exempt
                from.
              </Reveal>

              <Reveal delay={0.2}>
                <table className="home-rates us-nums">
                  <caption>Average domestic tariff, in &#8377; per kWh</caption>
                  <tbody>
                    {tariffs.map((item, i) => (
                      <tr key={item.state}>
                        <th scope="row">{item.state}</th>
                        <td className="home-rates-bar" aria-hidden="true">
                          <motion.span
                            style={{ width: `${(parseFloat(item.rate) / 8) * 100}%` }}
                            initial={reduce ? false : { scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: EASE }}
                          />
                        </td>
                        <td>&#8377;{item.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="us-small home-rates-note">
                  Stored for states and union territories across India,
                  alongside their net metering policy summaries.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Questions ---- */}
      <section className="home-faq us-section" aria-labelledby="home-faq-title">
        <div className="us-container home-faq-inner">
          <header className="home-faq-head">
            <Reveal as="p" className="us-eyebrow" kind="fade">
              Questions
            </Reveal>
            <SplitHeading
              as="h2"
              id="home-faq-title"
              className="us-h2"
              text="What people ask before they trust a number."
            />
          </header>

          <Stagger as="ul" className="home-faq-list" gap={0.05}>
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <StaggerItem as="li" key={item.q} className={`home-faq-item ${isOpen ? 'is-open' : ''}`}>
                  <h3 className="home-faq-q">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`home-faq-a-${i}`}
                      id={`home-faq-q-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span>{item.q}</span>
                      <span className="home-faq-icon" aria-hidden="true">
                        <Plus size={18} />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`home-faq-a-${i}`}
                        role="region"
                        aria-labelledby={`home-faq-q-${i}`}
                        className="home-faq-a"
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.36, ease: EASE }}
                      >
                        <p>{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>
    </>
  );
};

export default About;
