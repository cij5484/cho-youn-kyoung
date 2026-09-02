import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { isWorksPath, navigationItems, site } from '../../data/site';
import { HOME_HERO_RESET_EVENT } from '../hero/homeHeroEvents';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isSanjoDetail = location.pathname === '/performance/sanjo-gil-2026-08-16';
  const isPaperAlbumDetail = [
    '/album/ji-young-hee-ryu-haegeum-sanjo-2026',
    '/album/pyeongjo-hoesang-2026',
    '/album/yeongsan-hoesang-2026',
  ].includes(location.pathname);
  const isPyeongjoAlbumDetail = location.pathname === '/album/pyeongjo-hoesang-2026';
  const isYeongsanAlbumDetail = location.pathname === '/album/yeongsan-hoesang-2026';

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
    const handlePointerDown = (event: PointerEvent) => {
      if (headerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) menuButtonRef.current?.focus();
    setIsOpen((value) => !value);
  };

  const returnToHomeStart = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsOpen(false);
    navigate('/', { state: { resetHomeHeroAt: Date.now() } });
    window.dispatchEvent(new Event(HOME_HERO_RESET_EVENT));
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  return (
    <header ref={headerRef} className={`site-header${isSanjoDetail ? ' site-header--sanjo-detail' : ''}${isPaperAlbumDetail ? ' site-header--paper-album-detail' : ''}${isPyeongjoAlbumDetail ? ' site-header--pyeongjo-album-detail' : ''}${isYeongsanAlbumDetail ? ' site-header--yeongsan-album-detail' : ''}`}>
      <NavLink className="brand" to="/" onClick={returnToHomeStart}>{site.artistName}</NavLink>
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
