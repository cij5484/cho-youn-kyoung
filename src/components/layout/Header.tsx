import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { navigationItems, site } from '../../data/site';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isSanjoDetail = location.pathname === '/performance/sanjo-gil-2026-08-16';

  return (
    <header className={`site-header${isSanjoDetail ? ' site-header--sanjo-detail' : ''}`}>
      <NavLink className="brand" to="/" onClick={() => setIsOpen(false)}>{site.artistName}</NavLink>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigationItems.map((item) => <NavLink key={item.path} to={item.path}>{item.label}</NavLink>)}
      </nav>
      <button className="menu-button" type="button" aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen} aria-controls="mobile-menu" onClick={() => setIsOpen((value) => !value)}>
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <MobileMenu isOpen={isOpen} onNavigate={() => setIsOpen(false)} />
    </header>
  );
}
