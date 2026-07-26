import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { navigationItems, site } from '../../data/site';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement | null>(null);
  const location = useLocation();
  const isOpen = openPath === location.pathname;
  const isSanjoDetail = location.pathname === '/performance/sanjo-gil-2026-08-16';

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstMenuLinkRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenPath(null);
      menuButtonRef.current?.focus();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) menuButtonRef.current?.focus();
    setOpenPath(isOpen ? null : location.pathname);
  };

  return (
    <header className={`site-header${isSanjoDetail ? ' site-header--sanjo-detail' : ''}`}>
      <NavLink className="brand" to="/" onClick={() => setOpenPath(null)}>{site.artistName}</NavLink>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigationItems.map((item) => <NavLink key={item.path} to={item.path}>{item.label}</NavLink>)}
      </nav>
      <button ref={menuButtonRef} className="menu-button" type="button" aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen} aria-controls="mobile-menu" onClick={toggleMenu}>
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <MobileMenu isOpen={isOpen} onNavigate={() => setOpenPath(null)} firstLinkRef={firstMenuLinkRef} />
    </header>
  );
}
