/* UrjaShakti motion kit.
   A small set of UI-only wrappers on Framer Motion. They animate transform,
   opacity and clip-path only, never layout, and they hold no application
   state. Under prefers-reduced-motion every wrapper renders its children
   plainly and settled.

   `inView={false}` plays on mount instead of on scroll. The report page uses
   that everywhere inside the PDF capture area: an element still waiting for
   the viewport would be captured invisible. */

import React, { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  Variants,
} from 'framer-motion';

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const DUR = {
  micro: 0.18,
  state: 0.32,
  reveal: 0.7,
};

export const SPRING = { type: 'spring' as const, stiffness: 420, damping: 34 };

const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' };

type Kind = 'up' | 'fade' | 'left' | 'right' | 'scale';

const hiddenFor = (kind: Kind) => {
  switch (kind) {
    case 'fade':
      return { opacity: 0 };
    case 'left':
      return { opacity: 0, x: -32 };
    case 'right':
      return { opacity: 0, x: 32 };
    case 'scale':
      return { opacity: 0, scale: 0.96 };
    default:
      return { opacity: 0, y: 24 };
  }
};

const shown = { opacity: 1, x: 0, y: 0, scale: 1 };

type Tag = 'div' | 'section' | 'article' | 'li' | 'ul' | 'ol' | 'p' | 'span' | 'figure' | 'dl' | 'header' | 'aside' | 'tr';

interface RevealProps {
  as?: Tag;
  kind?: Kind;
  delay?: number;
  duration?: number;
  inView?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

/* One element arriving. */
export const Reveal: React.FC<RevealProps> = ({
  as = 'div',
  kind = 'up',
  delay = 0,
  duration = DUR.reveal,
  inView = true,
  children,
  ...rest
}) => {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as as any;
    return <Plain {...rest}>{children}</Plain>;
  }
  const M = (motion as any)[as];
  const transition = { duration, delay, ease: EASE };
  return inView ? (
    <M initial={hiddenFor(kind)} whileInView={shown} viewport={VIEWPORT} transition={transition} {...rest}>
      {children}
    </M>
  ) : (
    <M initial={hiddenFor(kind)} animate={shown} transition={transition} {...rest}>
      {children}
    </M>
  );
};

interface StaggerProps {
  as?: Tag;
  gap?: number;
  delay?: number;
  inView?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const groupVariants = (gap: number, delay: number): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/* A group whose children arrive one after another. Children are StaggerItem. */
export const Stagger: React.FC<StaggerProps> = ({
  as = 'div',
  gap = 0.07,
  delay = 0,
  inView = true,
  children,
  ...rest
}) => {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as as any;
    return <Plain {...rest}>{children}</Plain>;
  }
  const M = (motion as any)[as];
  const v = groupVariants(gap, delay);
  return inView ? (
    <M variants={v} initial="hidden" whileInView="shown" viewport={VIEWPORT} {...rest}>
      {children}
    </M>
  ) : (
    <M variants={v} initial="hidden" animate="shown" {...rest}>
      {children}
    </M>
  );
};

interface ItemProps {
  as?: Tag;
  kind?: Kind;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const StaggerItem: React.FC<ItemProps> = ({ as = 'div', kind = 'up', children, ...rest }) => {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as as any;
    return <Plain {...rest}>{children}</Plain>;
  }
  const M = (motion as any)[as];
  const variants: Variants = {
    hidden: hiddenFor(kind),
    shown: { ...shown, transition: { duration: DUR.reveal, ease: EASE } },
  };
  return (
    <M variants={variants} {...rest}>
      {children}
    </M>
  );
};

interface SplitProps {
  as?: 'h1' | 'h2' | 'h3' | 'p';
  text: string;
  /* Words to underline with the solar mark. Punctuation is ignored. */
  mark?: string[];
  delay?: number;
  inView?: boolean;
  className?: string;
  id?: string;
}

const bare = (w: string) => w.replace(/[^\p{L}\p{N}₹]/gu, '').toLowerCase();

/* A headline that rises word by word from behind a mask. The words stay real
   text in reading order, so assistive technology reads the sentence as is. */
export const SplitHeading: React.FC<SplitProps> = ({
  as = 'h2',
  text,
  mark = [],
  delay = 0,
  inView = true,
  ...rest
}) => {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  const marks = mark.map((m) => m.toLowerCase());
  const cls = (w: string) => (marks.includes(bare(w)) ? 'us-mark' : undefined);

  if (reduce) {
    const Plain = as as any;
    return (
      <Plain {...rest}>
        {words.map((w, i) => (
          <React.Fragment key={i}>
            <span className={cls(w)}>{w}</span>
            {i < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        ))}
      </Plain>
    );
  }

  const M = (motion as any)[as];
  const group: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: 0.045, delayChildren: delay } },
  };
  const word: Variants = {
    hidden: { y: '110%' },
    shown: { y: '0%', transition: { duration: 0.8, ease: EASE } },
  };
  const trigger = inView
    ? { initial: 'hidden', whileInView: 'shown', viewport: VIEWPORT }
    : { initial: 'hidden', animate: 'shown' };

  return (
    <M variants={group} {...trigger} {...rest}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span className="us-word">
            <motion.span variants={word} className={cls(w)}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </M>
  );
};

interface MaskProps {
  className?: string;
  delay?: number;
  inView?: boolean;
  radius?: number;
  children?: React.ReactNode;
}

/* A picture window opening: the frame unclips while the picture settles. */
export const MaskReveal: React.FC<MaskProps> = ({
  className,
  delay = 0,
  inView = true,
  radius = 28,
  children,
}) => {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} style={{ borderRadius: radius, overflow: 'hidden' }}>
        {children}
      </div>
    );
  }
  const frame: Variants = {
    hidden: { clipPath: `inset(14% 10% 14% 10% round ${radius}px)`, opacity: 0.4 },
    shown: {
      clipPath: `inset(0% 0% 0% 0% round ${radius}px)`,
      opacity: 1,
      transition: { duration: 1.1, delay, ease: EASE },
    },
  };
  const inner: Variants = {
    hidden: { scale: 1.14 },
    shown: { scale: 1, transition: { duration: 1.4, delay, ease: EASE } },
  };
  const trigger = inView
    ? { initial: 'hidden', whileInView: 'shown', viewport: VIEWPORT }
    : { initial: 'hidden', animate: 'shown' };
  return (
    <motion.div
      className={className}
      variants={frame}
      {...trigger}
      style={{ overflow: 'hidden', borderRadius: radius }}
    >
      <motion.div variants={inner} style={{ width: '100%', height: '100%' }}>
        {children}
      </motion.div>
    </motion.div>
  );
};

interface ParallaxProps {
  className?: string;
  /* Pixels of travel either side of rest. */
  distance?: number;
  children?: React.ReactNode;
}

/* Localised parallax tied to the element's own passage through the viewport.
   Native scrolling is untouched. */
export const Parallax: React.FC<ParallaxProps> = ({ className, distance = 40, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
};

/* A thin line across the top of the page, scrubbed to the scroll. */
export const ScrollProgress: React.FC = () => {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  if (reduce) return null;
  return <motion.div className="us-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
};
