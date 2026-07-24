import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isContact = location.pathname === '/contact';

  return (
    <div
      className={`page-transition${isHome ? ' page-transition--home' : ''}${isContact ? ' page-transition--contact' : ''}`}
      key={location.pathname}
    >
      {children}
    </div>
  );
}
