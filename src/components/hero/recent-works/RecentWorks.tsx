import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { albums } from '../../../data/albums';
import type { HomeHeroSlide } from '../../../data/homeHeroSlides';
import { preloadAlbumDetail } from '../../album/detail/preloadAlbumDetail';

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
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };
  const groups = (['PERFORMANCE', 'ALBUM'] as const).map((type) => ({
    type,
    label: type === 'PERFORMANCE' ? '독주회' : '앨범',
    items: works.map((work, index) => ({ work, index })).filter(({ work }) => work.workType === type),
  })).filter((group) => group.items.length > 0);
  const orderedIndices = groups.flatMap((group) => group.items.map(({ index }) => index));

  const hasFineHoverPointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const warmWork = (work: HomeHeroSlide) => {
    if (work.workType !== 'ALBUM') return;
    const album = albums.find((item) => item.id === work.id);
    if (album) void preloadAlbumDetail(album).catch(() => undefined);
  };

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
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
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
    warmWork(works[index]);
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
    const position = orderedIndices.indexOf(index);
    const nextPosition = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? works.length - 1
        : (position + (event.key === 'ArrowRight' ? 1 : -1) + works.length) % works.length;
    cardRefs.current[orderedIndices[nextPosition]]?.focus();
  };

  return (
    <div
      className={`recent-works${isOpen ? ' is-open' : ''}`}
      ref={rootRef}
      onPointerDownCapture={(event) => { interactionPointerTypeRef.current = event.pointerType; }}
      onPointerEnter={(event) => {
        cancelClose();
        if (event.pointerType === 'mouse' && hasFineHoverPointer()) setIsOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse' && hasFineHoverPointer()) {
          cancelClose();
          closeTimerRef.current = setTimeout(() => {
            setIsOpen(false);
            setInteractionIndex(null);
          }, 150);
        }
      }}
      onFocus={() => {
        cancelClose();
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
        <span>EXPLORE WORKS</span>
        <span className="recent-works__trigger-mark" aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>
      <div className="recent-works__panel" id="recent-works-list" aria-label="작품 둘러보기">
        <div className="recent-works__track" role="listbox" aria-label="HOME Hero 작품" ref={trackRef} onScroll={updateMobilePreview}>
          {groups.map((group) => (
            <div className="recent-works__group" role="group" aria-labelledby={`recent-works-${group.type}`} key={group.type}>
              <div className="recent-works__group-label" id={`recent-works-${group.type}`}>{group.label}</div>
              <div className="recent-works__shelf" role="presentation">
          {group.items.map(({ work, index }) => (
            <button
              className={`recent-work-card recent-work-card--${work.workType.toLowerCase()}${index === activeIndex && interactionIndex === null ? ' is-active' : ''}${index === interactionIndex ? ' is-interacting' : ''}${index === previewIndex ? ' is-preview' : ''}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              aria-label={`${work.workType === 'PERFORMANCE' ? '공연' : '앨범'} ${work.cardTitle ?? work.title}${work.cardSubtitle ? `, ${work.cardSubtitle}` : ''}, ${work.displayDate}`}
              key={work.id}
              ref={(node) => { cardRefs.current[index] = node; }}
              onClick={() => selectWork(index)}
              onKeyDown={(event) => handleCardKeyDown(event, index)}
              onPointerEnter={(event) => {
                if (event.pointerType !== 'mouse' || !hasFineHoverPointer()) return;
                warmWork(work);
                setInteractionIndex(index);
              }}
              onPointerLeave={(event) => { if (event.pointerType === 'mouse') setInteractionIndex(null); }}
              onFocus={() => {
                warmWork(work);
                setInteractionIndex(index);
              }}
              onBlur={() => setInteractionIndex(null)}
            >
              <span className="recent-work-card__image-wrap">
                <img src={`${import.meta.env.BASE_URL}${work.cardImage.replace(/^\//, '')}`} alt="" loading="lazy" />
              </span>
              <span className="recent-work-card__meta">
                <strong>{work.cardTitle ?? work.title}</strong>
                {work.cardSubtitle ? <span>{work.cardSubtitle}</span> : null}
                <span>{work.displayDate}</span>
              </span>
            </button>
          ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
