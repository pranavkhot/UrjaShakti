import React, { useEffect } from 'react';
import "./LoggedInHome.css";
import { ArrowRight, ArrowUpRight, PenTool, Receipt, FileText, Sun, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Reveal,
  Stagger,
  StaggerItem,
  SplitHeading,
  MaskReveal,
  Parallax,
} from '../../motion/kit';

const LoggedInHome: React.FC = () => {
  /* What each screen gives you. Every line describes something the product
     does today. */
  const features = [
    {
      icon: <PenTool size={22} strokeWidth={1.75} aria-hidden="true" />,
      title: "Roof map",
      description: "Outline your roof on a satellite view. The area is measured from the shape you draw.",
    },
    {
      icon: <Sun size={22} strokeWidth={1.75} aria-hidden="true" />,
      title: "Sunlight and tilt",
      description: "Average irradiance for your location, the capacity your roof can hold and the tilt angle to mount at.",
    },
    {
      icon: <Zap size={22} strokeWidth={1.75} aria-hidden="true" />,
      title: "Bill to units",
      description: "Your monthly bill becomes consumption in kWh, using the average domestic tariff for your state.",
    },
    {
      icon: <Users size={22} strokeWidth={1.75} aria-hidden="true" />,
      title: "Partner vendors",
      description: "Panel prices by the 500 W unit, with each vendor's representative, address and phone number.",
    },
  ];

  /* The three screens, in order. Each link is an existing route. */
  const journeySteps = [
    {
      icon: <PenTool size={24} strokeWidth={1.75} aria-hidden="true" />,
      title: "Measure your rooftop",
      description: "Search your address and trace the roof. Area, irradiance, capacity, daily energy and tilt are worked out and saved.",
      to: "/calculator",
      cta: "Open the roof map",
    },
    {
      icon: <Receipt size={24} strokeWidth={1.75} aria-hidden="true" />,
      title: "Assess your consumption",
      description: "Enter your monthly electricity bill and the number of people at home. It is saved against the roof you traced.",
      to: "/energy-estimation",
      cta: "Enter your bill",
    },
    {
      icon: <FileText size={24} strokeWidth={1.75} aria-hidden="true" />,
      title: "Get your detailed report",
      description: "System size, number of panels, cost with GST, subsidy, payback, a loan illustration and savings, ready to download.",
      to: "/report",
      cta: "Read the report",
    },
  ];

  // Scroll to the top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="logged-in-home lh us-page">
      {/* Hero Section */}
      <section className="lh-hero">
        <div className="us-container lh-hero-grid">
          <div className="lh-hero-copy">
            <Reveal as="p" className="us-eyebrow" kind="fade" inView={false} duration={0.4}>
              Your workspace
            </Reveal>
            <SplitHeading
              as="h1"
              className="us-h1 lh-hero-title"
              text="Your roof, your bill, one clear report."
              mark={['report.']}
              inView={false}
              delay={0.05}
            />
            <Reveal as="p" className="us-lead lh-hero-lead" inView={false} delay={0.35}>
              Three short screens take you from a satellite view of your home
              to what solar would cost you and give back.
            </Reveal>
            <Reveal className="lh-hero-actions" inView={false} delay={0.45}>
              <Link to="/calculator" className="us-btn us-btn--primary us-btn--lg">
                Calculate Savings <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
          <Parallax distance={20} className="lh-hero-figure">
            <MaskReveal className="lh-hero-image" inView={false} delay={0.15}>
              <img
                src="/images/solar-panel-hero-1600.jpg"
                alt="Solar panels behind a meadow of wild flowers"
                width={1600}
                height={1045}
              />
            </MaskReveal>
          </Parallax>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="lh-features us-band us-band--surface">
        <div className="us-container us-section us-section--tight">
          <SplitHeading as="h2" className="us-h2 lh-section-title" text="What you can do here" />
          <Stagger className="lh-features-grid" gap={0.08}>
            {features.map((feature, index) => (
              <StaggerItem key={index} className="lh-feature">
                <span className="lh-feature-icon">{feature.icon}</span>
                <h3 className="us-h3">{feature.title}</h3>
                <p>{feature.description}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Journey Section */}
      <section id="journey" className="lh-journey">
        <div className="us-container us-section">
          <header className="lh-journey-head">
            <SplitHeading as="h2" className="us-h2" text="Your Solar Journey" />
            <Reveal as="p" className="us-lead" delay={0.1}>
              From measuring your rooftop to getting a detailed report. Each
              step uses the most recent roof and bill you saved.
            </Reveal>
          </header>
          <Stagger as="ol" className="lh-journey-list" gap={0.12}>
            {journeySteps.map((step, index) => (
              <StaggerItem as="li" key={index} className="lh-step">
                <Link to={step.to} className="lh-step-link">
                  <span className="lh-step-num us-nums">{`0${index + 1}`}</span>
                  <span className="lh-step-icon">{step.icon}</span>
                  <span className="lh-step-body">
                    <span className="lh-step-title">{step.title}</span>
                    <span className="lh-step-desc">{step.description}</span>
                  </span>
                  <span className="lh-step-cta">
                    {step.cta}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA Section */}
      <section className="lh-cta us-band us-band--deep">
        <div className="us-container us-section us-section--tight lh-cta-inner">
          <div>
            <SplitHeading as="h2" className="us-h2" text="Ready when your roof is." />
            <Reveal as="p" className="us-lead lh-cta-lead" delay={0.15}>
              The estimate starts on the map. It takes a search and a few
              clicks round the outline.
            </Reveal>
          </div>
          <Reveal kind="scale" delay={0.2}>
            <Link to="/calculator" className="us-btn us-btn--primary us-btn--lg">
              Get Your Free Solar Estimate <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default LoggedInHome;
