/* The homepage motion system.
   One easing, one grammar, one signature moment. Only transform, opacity and
   filter are animated, so nothing here moves the layout.

   Everything is wrapped in gsap.matchMedia(): under prefers-reduced-motion
   the content is simply shown, Lenis never starts and nothing moves. The
   start states are set from JavaScript, and index.html carries a failsafe
   that reveals the page if this module never runs. */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/* One easing for everything. power3.out is the same curve as the
   cubic-bezier(0.22, 1, 0.36, 1) in the stylesheet, without pulling in
   the CustomEase plugin. */
const EASE = 'power3.out';

/* Counts are formatted the Indian way and keep the decimals the final text
   already has, so the number never changes shape as it runs. */
function formatLike(sample: string, value: number): string {
  const decimals = (sample.split('.')[1] || '').replace(/[^0-9]/g, '').length;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function useHomeMotion() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const html = document.documentElement;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
      const groups = gsap.utils.toArray<HTMLElement>('[data-reveal-group]', root);
      const groupKids = groups.flatMap((g) => Array.from(g.children) as HTMLElement[]);

      /* Reduced motion: show everything, start nothing. */
      if (reduced) {
        gsap.set([...reveals, ...groupKids], { clearProps: 'all', opacity: 1 });
        html.classList.add('motion-ready');
        return;
      }

      /* Hidden start states come from here, never from the stylesheet alone,
         so a failure leaves the page readable. */
      gsap.set(reveals, { opacity: 0, y: 24, filter: 'blur(6px)' });
      gsap.set(groupKids, { opacity: 0, y: 24, filter: 'blur(6px)' });
      html.classList.add('motion-ready');

      const phone = window.matchMedia('(max-width: 720px)').matches;
      const dist = phone ? 0.5 : 1;

      /* ---- Smooth scrolling, this page only -------------------------- */
      const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      const ticker = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      const splits: SplitText[] = [];

      const splitLines = (el: Element) => {
        const s = new SplitText(el as HTMLElement, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'us-line',
        });
        splits.push(s);
        return s;
      };

      /* ---- 1. The page load, about 1.4s ------------------------------ */
      const headline = root.querySelector('[data-split-hero]');
      const tl = gsap.timeline({ defaults: { ease: EASE } });

      gsap.set('.header', { y: -12, opacity: 0 });
      tl.to('.header', { y: 0, opacity: 1, duration: 0.6 }, 0);

      if (headline) {
        const s = splitLines(headline);
        tl.from(s.lines, { yPercent: 110, duration: 0.9, stagger: 0.07 }, 0);
      }
      tl.from('[data-hero-lead]', { y: 24 * dist, opacity: 0, duration: 0.7 }, 0.45);
      tl.from('[data-hero-actions] > *', { y: 16 * dist, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.6);
      tl.from('[data-hero-facts] > *', { y: 16 * dist, opacity: 0, duration: 0.6, stagger: 0.07 }, 0.75);
      tl.from('[data-hero-visual]', { scale: 0.96, opacity: 0, duration: 1 }, 0.5);

      /* ---- 2. Section headings, same masked line reveal --------------- */
      gsap.utils.toArray<HTMLElement>('[data-split]', root).forEach((el) => {
        const s = splitLines(el);
        gsap.from(s.lines, {
          yPercent: 110,
          duration: 0.9,
          stagger: 0.07,
          ease: EASE,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      /* ---- 3. Paragraphs, cards, rows -------------------------------- */
      ScrollTrigger.batch(reveals, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            stagger: 0.08,
            ease: EASE,
          }),
      });

      groups.forEach((group) => {
        gsap.to(Array.from(group.children), {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.08,
          ease: EASE,
          scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        });
      });

      /* ---- 4. Figures count up to their real value -------------------- */
      gsap.utils.toArray<HTMLElement>('[data-count]', root).forEach((el) => {
        const target = parseFloat(el.dataset.count || '0');
        if (!isFinite(target)) return;
        const sample = el.textContent || '';
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => {
            el.textContent = formatLike(sample, obj.v);
          },
          onComplete: () => {
            el.textContent = formatLike(sample, target);
          },
        });
      });

      /* ---- 5. Parallax, desktop only ---------------------------------- */
      if (!phone) {
        const visual = root.querySelector('[data-parallax]');
        if (visual) {
          gsap.to(visual, {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: { trigger: visual, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        }
      }

      /* ---- 6. The one pinned sequence --------------------------------- */
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]', root);
      const stepsWrap = root.querySelector('[data-steps]');
      const stepsHead = root.querySelector('[data-steps-head]');

      /* The heading column is held in place by CSS sticky; this drives the
         sequence inside it. The step being read lights up and the counter
         follows it. Nothing is dimmed: fading the other steps drops their
         text below the contrast floor the moment a reader pauses. */
      const counter = root.querySelector<HTMLElement>('[data-step-current]');

      if (steps.length && stepsWrap && stepsHead && !phone) {
        steps.forEach((step, i) => {
          ScrollTrigger.create({
            trigger: step,
            start: 'top 70%',
            end: 'bottom 45%',
            onToggle: (self) => {
              step.classList.toggle('is-active', self.isActive);
              if (self.isActive && counter) {
                counter.textContent = `0${i + 1}`;
              }
            },
          });
        });
      }

      /* ---- 7. The scroll progress line -------------------------------- */
      const bar = document.querySelector('[data-progress]');
      if (bar) {
        gsap.to(bar, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
        });
      }

      /* Triggers drift when fonts and images land late. */
      const refresh = () => ScrollTrigger.refresh();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
      window.addEventListener('load', refresh);

      return () => {
        window.removeEventListener('load', refresh);
        gsap.ticker.remove(ticker);
        lenis.destroy();
        splits.forEach((s) => s.revert());
      };
    },
    { scope }
  );

  return scope;
}

export default useHomeMotion;

