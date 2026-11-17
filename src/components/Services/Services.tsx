// src/components/Services/Services.tsx
import React from 'react';
import { Link } from 'react-router-dom';
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
import './Services.css';

/* Every label below is a line the report actually prints
   (src/components/Report/Report.tsx). */
const reportGroups = [
  {
    title: 'Your roof',
    items: [
      'Total roof space',
      'Usable roof space',
      'Area needed for the panels',
      'Optimal tilt angle',
      'Optimal orientation',
    ],
  },
  {
    title: 'Energy',
    items: [
      'Monthly and yearly usage in kWh',
      'Required system size',
      'Annual production',
      'Average daily irradiance',
      'Average yearly irradiance',
    ],
  },
  {
    title: 'What it costs',
    items: [
      '500 W units required',
      'Panel cost before GST',
      'GST at 12%',
      'Cost with GST',
      'Eligible subsidy',
      'Cost after subsidy',
    ],
  },
  {
    title: 'What comes back',
    items: [
      'Payback period in years',
      'Annual savings',
      'Savings over 25 years',
      'CO2 avoided per year',
    ],
  },
  {
    title: 'If you borrow',
    items: [
      'Loan amount after 20% down',
      'Monthly EMI at 8.5% over 10 years',
      'Total interest payable',
      'Your bill now, and after solar',
      'Bill plus EMI, and the net monthly saving',
    ],
  },
];

const panels = [
  { name: 'Monocrystalline', efficiency: '20%', price: '20,000 - 22,000' },
  { name: 'Polycrystalline', efficiency: '16%', price: '17,500 - 19,000' },
  { name: 'Thin-film', efficiency: '14%', price: '15,000 - 16,500' },
];

/* The three subsidy tiers the report applies. The bar heights are the tier
   amounts to scale: 30, 60 and 78 thousand rupees. */
const tiers = [
  { range: 'Up to 2 kW', amount: '30,000', note: 'per kW', height: 38 },
  { range: '2 kW to 3 kW', amount: '60,000', note: 'plus ₹18,000 per kW above 2', height: 77 },
  { range: '3 kW and above', amount: '78,000', note: 'capped', height: 100 },
];

const Services: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <section id="services" className="home-services">
      {/* ---- The subsidy: a staircase on the teal band ---- */}
      <div className="us-band us-band--leaf us-section home-subsidy">
        <div className="us-container home-subsidy-inner">
          <div className="home-subsidy-copy">
            <Reveal as="p" className="us-eyebrow" kind="fade">
              Rooftop subsidy
            </Reveal>
            <SplitHeading
              as="h2"
              className="us-h2"
              text="The subsidy is worked into your price, not left for you to chase."
            />
            <Reveal as="p" className="us-lead home-subsidy-lead" delay={0.15}>
              UrjaShakti applies the rooftop subsidy tier to the system it
              sizes for you, then quotes the cost after it and the payback on
              that figure.
            </Reveal>
          </div>

          <Stagger as="dl" className="home-subsidy-tiers us-nums" gap={0.14}>
            {tiers.map((tier, i) => (
              <StaggerItem key={tier.range} className="home-subsidy-tier" kind="fade">
                <motion.span
                  className="home-subsidy-bar"
                  aria-hidden="true"
                  style={{ height: `${tier.height}%` }}
                  initial={reduce ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.14, ease: EASE }}
                />
                <dt>{tier.range}</dt>
                <dd>
                  <b className="us-figure us-figure--inline">
                    <span className="us-unit us-unit--before">&#8377;</span>
                    <span>{tier.amount}</span>
                  </b>
                  <span className="home-subsidy-note">{tier.note}</span>
                </dd>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>

      {/* ---- What the report contains ---- */}
      <div className="us-container us-section home-report">
        <header className="home-report-head">
          <div>
            <Reveal as="p" className="us-eyebrow" kind="fade">
              Your report
            </Reveal>
            <SplitHeading
              as="h2"
              className="us-h2"
              text="Every figure, worked out for your address."
              mark={['address']}
            />
          </div>
          <Reveal as="p" className="us-lead" delay={0.15}>
            One page you can read in a few minutes, download as a PDF and take
            to an installer. It also charts your production against your
            consumption.
          </Reveal>
        </header>

        <Parallax distance={18}>
          <MaskReveal className="home-report-image" radius={28}>
            <img
              src="/images/solar-1600.jpg"
              alt="Rows of solar panels seen from directly above, curving across a roof"
              width={1600}
              height={1199}
              loading="lazy"
            />
          </MaskReveal>
        </Parallax>

        <Stagger className="home-report-groups" gap={0.08}>
          {reportGroups.map((group, i) => (
            <StaggerItem key={group.title} className="home-report-group">
              <span className="home-report-index us-nums">{`0${i + 1}`}</span>
              <h3 className="home-report-group-title">{group.title}</h3>
              <ul className="home-report-list">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* ---- Panels and partners: the vendor next step ---- */}
      <div className="us-band us-band--surface us-section home-partners">
        <div className="us-container home-partners-inner">
          <div className="home-partners-copy">
            <Reveal as="p" className="us-eyebrow" kind="fade">
              Panels and partners
            </Reveal>
            <SplitHeading
              as="h2"
              className="us-h2"
              text="Real panels, at prices our partners quote."
            />
            <Reveal as="p" className="us-lead home-partners-lead" delay={0.15}>
              The report prices your system against the panel types our partner
              vendors stock, by the 500 W unit. When you are ready, their
              representative, location and phone number are on the partners
              page, and you can start a message in one tap.
            </Reveal>
            <Reveal delay={0.25}>
              <Link to="/vendor" className="us-btn us-btn--ink home-partners-cta">
                See the partners
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <Reveal kind="right" className="home-partners-table-wrap">
            <table className="home-partners-table us-nums">
              <caption>Price per 500 W unit, across our partner vendors</caption>
              <thead>
                <tr>
                  <th scope="col">Panel type</th>
                  <th scope="col">Efficiency</th>
                  <th scope="col">Per 500 W unit</th>
                </tr>
              </thead>
              <tbody>
                {panels.map((panel) => (
                  <tr key={panel.name}>
                    <th scope="row">{panel.name}</th>
                    <td>{panel.efficiency}</td>
                    <td className="home-partners-price">&#8377;{panel.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Services;
