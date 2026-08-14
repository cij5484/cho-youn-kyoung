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
  const [previewIndex, setPreviewIndex] = useState(activeIndex);
  const [interactionIndex, setInteractionIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const interactionPointerTypeRef = useRef<string | null>(null);
  const suppressFocusOpenRef = useRef(false);
  const scrollFrameRef = useRef<number | null>(null);

  const hasFineHoverPointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || !isOpen) return;
      setIsOpen(false);
      suppressFocusOpenRef.current = true;
      rootRef.current?.querySelector<HTMLButtonElement>('.recent-works__trigger')?.focus();
      window.queueMicrotask(() => { suppressFocusOpenRef.current = false; });
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => () => {
    if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
  }, []);

  const updateMobilePreview = () => {
    if (hasFineHoverPointer() || scrollFrameRef.current !== null) return;
    scrollFrameRef.current = requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const track = trackRef.current;
      if (!track) return;
      const center = track.getBoundingClientRect().left + track.clientWidth / 2;
      let closestIndex = previewIndex;
      let closestDistance = Number.POSITIVE_INFINITY;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - center);
        if (distance < closestDistance) { closestDistance = distance; closestIndex = index; }
      });
      setPreviewIndex((current) => current === closestIndex ? current : closestIndex);
    });
  };

  const selectWork = (index: number) => {
    setPreviewIndex(index);
    onSelect(index);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cardRefs.current[index]?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });

    if (!hasFineHoverPointer()) {
      setIsOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>('.recent-works__trigger')?.focus();
    }
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
      onPointerDownCapture={(event) => { interactionPointerTypeRef.current = event.pointerType; }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' && hasFineHoverPointer()) setIsOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse' && hasFineHoverPointer()) setIsOpen(false);
      }}
      onFocus={() => {
        if (suppressFocusOpenRef.current) return;
        if (
          interactionPointerTypeRef.current === null
          || (interactionPointerTypeRef.current === 'mouse' && hasFineHoverPointer())
        ) setIsOpen(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <button
        className="recent-works__trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls="recent-works-list"
        onClick={(event) => {
          const isFineMouseClick = event.detail > 0
            && interactionPointerTypeRef.current === 'mouse'
            && hasFineHoverPointer();
          setIsOpen((open) => isFineMouseClick ? true : !open);
          interactionPointerTypeRef.current = null;
        }}
      >
        <span>RECENT WORKS</span>
        <span className="recent-works__trigger-mark" aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>
      <div className="recent-works__panel" id="recent-works-list" aria-label="최근 작품 선택">
        <div className="recent-works__track" role="listbox" aria-label="HOME Hero 작품" ref={trackRef} onScroll={updateMobilePreview}>
          {works.map((work, index) => (
            <button
              className={`recent-work-card recent-work-card--${work.workType.toLowerCase()}${index === activeIndex && interactionIndex === null ? ' is-active' : ''}${index === interactionIndex ? ' is-interacting' : ''}${index === previewIndex ? ' is-preview' : ''}`}
              style={{ '--work-index': index, '--work-count': works.length } as React.CSSProperties}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              aria-label={`${work.workType === 'PERFORMANCE' ? '공연' : '앨범'} ${work.title}, ${work.displayDate}`}
              key={work.id}
              ref={(node) => { cardRefs.current[index] = node; }}
              onClick={() => selectWork(index)}
              onKeyDown={(event) => handleCardKeyDown(event, index)}
              onPointerEnter={(event) => { if (event.pointerType === 'mouse' && hasFineHoverPointer()) setInteractionIndex(index); }}
              onPointerLeave={(event) => { if (event.pointerType === 'mouse') setInteractionIndex(null); }}
              onFocus={() => setInteractionIndex(index)}
              onBlur={() => setInteractionIndex(null)}
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
