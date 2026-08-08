import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { HomeHeroSlide } from '../../../data/homeHeroSlides';

type RecentWorksProps = {
  works: HomeHeroSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function RecentWorks({ works, activeIndex, onSelect }: RecentWorksProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || !isOpen) return;
      setIsOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>('.recent-works__trigger')?.focus();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const selectWork = (index: number) => {
    onSelect(index);
    cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? works.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + works.length) % works.length;
    cardRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      className={`recent-works${isOpen ? ' is-open' : ''}`}
      ref={rootRef}
      onPointerEnter={() => setIsOpen(true)}
      onPointerLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <button
        className="recent-works__trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls="recent-works-list"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>RECENT WORKS</span>
        <span className="recent-works__trigger-mark" aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>
      <div className="recent-works__panel" id="recent-works-list" aria-label="최근 작품 선택">
        <div className="recent-works__track" role="listbox" aria-label="HOME Hero 작품">
          {works.map((work, index) => (
            <button
              className={`recent-work-card${index === activeIndex ? ' is-active' : ''}`}
              style={{ '--work-index': index, '--work-count': works.length } as React.CSSProperties}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              aria-label={`${work.workType === 'PERFORMANCE' ? '공연' : '앨범'} ${work.title}, ${work.displayDate}`}
              key={work.id}
              ref={(node) => { cardRefs.current[index] = node; }}
              onClick={() => selectWork(index)}
              onKeyDown={(event) => handleCardKeyDown(event, index)}
            >
              <span className="recent-work-card__image-wrap">
                <img src={`${import.meta.env.BASE_URL}${work.cardImage.replace(/^\//, '')}`} alt="" loading="lazy" />
              </span>
              <span className="recent-work-card__meta">
                <span className="recent-work-card__type">{work.workType}</span>
                <strong>{work.title}</strong>
                <span>{work.displayDate}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
