import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { Reveal } from '../components/Reveal';
import { type ProfilePerformance, profile } from '../data/profile';
import { assetUrl } from '../utils/assetUrl';
import '../styles/about.css';

const getTimelineSortKey = (item: ProfilePerformance, index: number) => ({
  primary: item.date ?? item.year,
  index,
});

const compareTimelineItems = (a: { item: ProfilePerformance; index: number }, b: { item: ProfilePerformance; index: number }) => {
  const aKey = getTimelineSortKey(a.item, a.index);
  const bKey = getTimelineSortKey(b.item, b.index);
  const dateCompare = aKey.primary.localeCompare(bKey.primary);
  return dateCompare === 0 ? aKey.index - bKey.index : dateCompare;
};

export function AboutPage() {
  const featuredAlbum = profile.discography[0];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectionDirection, setSelectionDirection] = useState<'previous' | 'next'>('next');
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndexRef = useRef(0);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelDeltaRef = useRef(0);
  const activeImage = profile.galleryImages[activeImageIndex] ?? profile.galleryImages[0];
  const timelinePerformances = [...profile.performances]
    .map((item, index) => ({ item, index }))
    .sort(compareTimelineItems)
    .map(({ item }) => item);
  const englishNameParts = profile.englishName.split(' ');
  const [roleLead, ...roleRestParts] = profile.role.split(' ');
  const roleRest = roleRestParts.join(' ');

  const centerThumbnail = useCallback((index: number) => {
    const strip = stripRef.current;
    const thumbnail = thumbnailRefs.current[index];
    if (!strip || !thumbnail) return;

    const left = thumbnail.offsetLeft - (strip.clientWidth - thumbnail.offsetWidth) / 2;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    strip.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, []);

  const selectImage = useCallback((requestedIndex: number, options?: { focus?: boolean; center?: boolean }) => {
    const index = Math.max(0, Math.min(profile.galleryImages.length - 1, requestedIndex));
    const previousIndex = activeIndexRef.current;
    activeIndexRef.current = index;
    if (index !== previousIndex) {
      setSelectionDirection(index > previousIndex ? 'next' : 'previous');
      setActiveImageIndex(index);
    }
    if (options?.center !== false) centerThumbnail(index);
    if (options?.focus) thumbnailRefs.current[index]?.focus({ preventScroll: true });
  }, [centerThumbnail]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const settleSelection = () => {
      if (!window.matchMedia('(max-width: 1180px)').matches) return;
      const stripCenter = strip.getBoundingClientRect().left + strip.clientWidth / 2;
      let closestIndex = activeIndexRef.current;
      let closestDistance = Number.POSITIVE_INFINITY;
      thumbnailRefs.current.forEach((thumbnail, index) => {
        if (!thumbnail) return;
        const bounds = thumbnail.getBoundingClientRect();
        const distance = Math.abs(bounds.left + bounds.width / 2 - stripCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      selectImage(closestIndex);
    };

    const handleScroll = () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(settleSelection, 140);
    };

    const handleWheel = (event: WheelEvent) => {
      if (!window.matchMedia('(min-width: 1181px) and (pointer: fine)').matches || wheelLockTimerRef.current) return;
      wheelDeltaRef.current += event.deltaY;
      if (Math.abs(wheelDeltaRef.current) < 36) return;

      const direction = wheelDeltaRef.current > 0 ? 1 : -1;
      wheelDeltaRef.current = 0;
      const currentIndex = activeIndexRef.current;
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= profile.galleryImages.length) return;

      event.preventDefault();
      selectImage(nextIndex);
      wheelLockTimerRef.current = setTimeout(() => {
        wheelLockTimerRef.current = null;
      }, 380);
    };

    strip.addEventListener('scroll', handleScroll, { passive: true });
    strip.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      strip.removeEventListener('scroll', handleScroll);
      strip.removeEventListener('wheel', handleWheel);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (wheelLockTimerRef.current) clearTimeout(wheelLockTimerRef.current);
    };
  }, [selectImage]);

  const handleThumbnailKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    selectImage(index + (event.key === 'ArrowRight' ? 1 : -1), { focus: true });
  };

  return (
    <article className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero__copy">
          <p className="about-kicker">ABOUT</p>
          <h1 id="about-title" aria-label={profile.englishName}>{englishNameParts.map((namePart) => <span key={namePart}>{namePart}</span>)}</h1>
          <p className="about-hero__role"><span>{roleLead}</span>{roleRest && ` ${roleRest}`}</p>
          <p className="about-hero__position">{profile.currentPosition}</p>
        </div>
        <figure className={`about-hero__portrait about-hero__portrait--${selectionDirection}`}>
          <SafeImage key={activeImage.src} src={assetUrl(activeImage.src)} alt={activeImage.alt} fallbackClassName="about-hero__portrait-fallback" fallbackLabel={profile.englishName} objectPosition={activeImage.objectPosition ?? 'center bottom'} />
        </figure>
      </section>

      <section className="about-gallery" aria-label="조윤경 프로필 사진 선택">
        <div className="about-gallery__inner">
          <div className="about-gallery__spacer" aria-hidden="true" />
          <div className="about-gallery__strip" ref={stripRef}>
            {profile.galleryImages.map((image, index) => (
              <button
                className={`about-gallery__thumbnail${index === activeImageIndex ? ' is-active' : ''}`}
                type="button"
                key={image.src}
                ref={(element) => { thumbnailRefs.current[index] = element; }}
                aria-label={image.ariaLabel}
                aria-pressed={index === activeImageIndex}
                onClick={() => selectImage(index)}
                onKeyDown={(event) => handleThumbnailKeyDown(event, index)}
              >
                <SafeImage
                  src={assetUrl(image.thumbnail)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  fallbackClassName="about-gallery__thumbnail-fallback"
                  fallbackLabel="PROFILE"
                  objectPosition={image.thumbnailObjectPosition ?? image.objectPosition ?? 'center center'}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="about-body">
        <Reveal as="section" className="about-section about-bio" aria-labelledby="biography-title">
          <div className="about-section__heading reveal__heading">
            <span>01</span>
            <h2 id="biography-title">BIOGRAPHY</h2>
          </div>
          <div className="about-bio__grid reveal__content">
            <div className="about-prose">
              {profile.biography.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <aside className="about-facts" aria-label="학력 및 현재 활동">
              <div>
                <h3>EDUCATION</h3>
                <ul>
                  {profile.education.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>CURRENT POSITION</h3>
                {profile.positions.slice(0, 3).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </aside>
          </div>
        </Reveal>

        <Reveal as="section" className="about-section" aria-labelledby="timeline-title">
          <div className="about-section__heading reveal__heading">
            <span>02</span>
            <h2 id="timeline-title">CAREER TIMELINE</h2>
          </div>
          <div className="about-timeline reveal__content">
            {timelinePerformances.map((item) => {
              const content = (
                <>
                  <time>{item.year}</time>
                  <div className="about-timeline__headline">
                    <h3>「{item.title}」</h3>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </>
              );

              return item.href ? (
                <Link className="about-timeline__item about-timeline__item--link" to={item.href} key={`${item.year}-${item.title}`}>
                  {content}
                </Link>
              ) : (
                <article className="about-timeline__item" key={`${item.year}-${item.title}`}>
                  {content}
                </article>
              );
            })}
          </div>
          <details className="about-more">
            <summary>전체 경력 보기</summary>
            <div className="about-more__grid">
              <div>
                <h3>AWARDS</h3>
                <ul>{profile.awards.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <h3>POSITIONS</h3>
                <ul>{profile.positions.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </details>
        </Reveal>

        {featuredAlbum && (
          <Reveal as="section" className="about-section about-discography" aria-labelledby="discography-title">
            <div className="about-section__heading reveal__heading">
              <span>03</span>
              <h2 id="discography-title">DISCOGRAPHY</h2>
            </div>
            <div className={`about-discography__item reveal__content${featuredAlbum.coverImage ? " has-cover" : ""}`}>
              {featuredAlbum.coverImage && <SafeImage src={assetUrl(featuredAlbum.coverImage)} alt={`${featuredAlbum.title} 앨범 커버`} />}
              <div>
                <p>{featuredAlbum.year}</p>
                <h3>「{featuredAlbum.title}」</h3>
                <span>{featuredAlbum.description}</span>
                {featuredAlbum.detailsPath && <Link to={featuredAlbum.detailsPath}>VIEW DETAILS</Link>}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}
