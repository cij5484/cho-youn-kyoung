import { RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { navigationItems } from '../../data/site';

type MobileMenuProps = { isOpen: boolean; onNavigate: () => void; firstLinkRef: RefObject<HTMLAnchorElement | null> };

export function MobileMenu({ isOpen, onNavigate, firstLinkRef }: MobileMenuProps) {
  return (
    <nav id="mobile-menu" className={`mobile-menu ${isOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!isOpen}>
      {navigationItems.map((item, index) => <NavLink ref={index === 0 ? firstLinkRef : undefined} key={item.path} to={item.path} onClick={onNavigate} tabIndex={isOpen ? 0 : -1}>{item.label}</NavLink>)}
    </nav>
  );
}
