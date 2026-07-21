import { type CSSProperties, type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from 'react';

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'section';
  children: ReactNode;
  delay?: number;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Reveal({
  as = 'div',
  children,
  className = '',
  delay = 0,
  style,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(() => typeof window === 'undefined' || prefersReducedMotion());
  const revealClassName = `reveal${isVisible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`;
  const revealStyle = { '--reveal-delay': `${Math.min(delay, 160)}ms`, ...style } as CSSProperties;
  const setRevealRef = (node: HTMLElement | null) => { ref.current = node; };

  useEffect(() => {
    const node = ref.current;

    if (!node || prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  if (as === 'section') {
    return <section {...props} ref={setRevealRef} className={revealClassName} style={revealStyle}>{children}</section>;
  }

  return <div {...props} ref={setRevealRef} className={revealClassName} style={revealStyle}>{children}</div>;
}
