import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { isWorksPath, navigationItems, site } from '../../data/site';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement | null>(null);
  const location = useLocation();
  const isSanjoDetail = location.pathname === '/performance/sanjo-gil-2026-08-16';
  const isJiAlbumDetail = location.pathname === '/album/ji-young-hee-ryu-haegeum-sanjo-2026';

  useEffect(() => {
    const closeMenu = window.setTimeout(() => setIsOpen(false), 0);
    return () => window.clearTimeout(closeMenu);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstMenuLinkRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
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
    setIsOpen((value) => !value);
  };

  return (
    <header className={`site-header${isSanjoDetail ? ' site-header--sanjo-detail' : ''}${isJiAlbumDetail ? ' site-header--ji-album-detail' : ''}`}>
      <NavLink className="brand" to="/" onClick={() => setIsOpen(false)}>{site.artistName}</NavLink>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigationItems.map((item) => <NavLink key={item.path} to={item.path} className={({ isActive }) => (item.path === '/works' ? isWorksPath(location.pathname) : isActive) ? 'active' : undefined}>{item.label}</NavLink>)}
      </nav>
      <button ref={menuButtonRef} className="menu-button" type="button" aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen} aria-controls="mobile-menu" onClick={toggleMenu}>
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <MobileMenu isOpen={isOpen} onNavigate={() => setIsOpen(false)} firstLinkRef={firstMenuLinkRef} />
    </header>
  );
}
