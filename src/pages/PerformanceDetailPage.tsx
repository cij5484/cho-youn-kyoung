import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { Reveal } from '../components/Reveal';
import { performances, type ArchiveMaterial, type PerformanceCollaborator, type ProgramWork } from '../data/performances';
import { assetUrl } from '../utils/assetUrl';
import '../styles/performance-detail.css';


type ArchivePreview = {
  label: 'POSTER' | 'LEAFLET';
  closeLabel: string;
  images: Array<{
    src: string;
    alt: string;
    label?: string;
  }>;
};

const flattenWorks = (performance: (typeof performances)[number]) => performance.programEras.flatMap((era) => era.works);

export function PerformanceDetailPage() {
  const { id } = useParams();
  const performance = performances.find((item) => item.id === id);
  const [selectedWork, setSelectedWork] = useState<ProgramWork | null>(null);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<PerformanceCollaborator | null>(null);
  const [selectedArchivePreview, setSelectedArchivePreview] = useState<ArchivePreview | null>(null);
  const lastArchivePreviewButton = useRef<HTMLButtonElement | null>(null);
  const archiveViewerRef = useRef<HTMLDivElement | null>(null);
  const lastArtistButton = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const works = useMemo(() => (performance ? flattenWorks(performance) : []), [performance]);
  const activeArtistIndex = selectedArtist && performance ? performance.collaborators.findIndex((artist) => artist.id === selectedArtist.id) : -1;

  useEffect(() => {
    if (!selectedArtist) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const panel = panelRef.current;
    panel?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedArtist(null);
      if (event.key !== 'Tab' || !panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); lastArtistButton.current?.focus(); };
  }, [selectedArtist]);

  useEffect(() => {
    if (!selectedArchivePreview) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const viewer = archiveViewerRef.current;
    viewer?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedArchivePreview(null);
      if (event.key !== 'Tab' || !viewer) return;
      const focusables = Array.from(viewer.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); lastArchivePreviewButton.current?.focus(); };
  }, [selectedArchivePreview]);

  if (!performance) {
    return <section className="page-shell"><h1>Performance not found</h1><Link className="text-link" to="/performance">Back to performance</Link></section>;
  }

  if (performance.id === 'sanjo-gil-2026-08-16') {
    const [program01, program02] = performance.programEras;
    const previousPerformance = performances.find((item) => item.id === 'haegeum-2026-08-02');

    return (
      <article className="sanjo-detail">
        <section className="sanjo-detail__hero" aria-labelledby="sanjo-detail-title">
          <div className="sanjo-detail__hero-copy">
            <Link className="sanjo-detail__back" to="/performance">← BACK TO PERFORMANCE</Link>
            <p>SANJO-GIL PROJECT 02</p>
            <h1 id="sanjo-detail-title"><span>산조길,</span><strong>둘</strong></h1>
            <h2>{performance.subtitle}</h2>
            <dl>
              <div><dt>DATE</dt><dd>{performance.displayDate}</dd></div>
              <div><dt>VENUE</dt><dd>{performance.venue}</dd></div>
            </dl>
          </div>
          <div className="sanjo-detail__orb" aria-hidden="true" />
        </section>

        <Reveal as="section" className="sanjo-detail__quick sanjo-detail__section" aria-labelledby="sanjo-quick-title">
          <p className="sanjo-detail__label">QUICK INFORMATION</p>
          <h2 id="sanjo-quick-title">공연 정보</h2>
          <dl><div><dt>일시</dt><dd>{performance.displayDate}</dd></div><div><dt>장소</dt><dd>{performance.venue}</dd></div></dl>
        </Reveal>

        <Reveal as="section" className="sanjo-detail__note sanjo-detail__section" aria-labelledby="sanjo-note-title">
          <p className="sanjo-detail__label">ARTIST’S NOTE</p>
          <h2 id="sanjo-note-title">연주자의 말</h2>
          <blockquote>
            <p className="sanjo-detail__lead">{performance.artistNote[0]}</p>
            {performance.artistNote.slice(1).map((note) => <p key={note}>{note}</p>)}
            <cite>{performance.artistSignature}</cite>
          </blockquote>
        </Reveal>

        <Reveal as="section" className="sanjo-program sanjo-program--one" aria-labelledby="sanjo-program-one">
          <span className="sanjo-program__ghost">01</span>
          <div className="sanjo-program__side"><p>PROGRAM 01</p><h2 id="sanjo-program-one">{program01.title}</h2><ul>{program01.works[0].instrumentation?.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div className="sanjo-program__notes"><p>{program01.works[0].composerNote}</p><p>{program01.works[0].workNote}</p></div>
        </Reveal>

        <Reveal as="section" className="sanjo-program sanjo-program--two" aria-labelledby="sanjo-program-two">
          <div className="sanjo-program__side"><p>PROGRAM 02</p><h2 id="sanjo-program-two">{program02.title}</h2><ul>{program02.works[0].instrumentation?.map((item) => <li key={item}>{item}</li>)}</ul><strong>{program02.description}</strong></div>
          <div className="sanjo-program__notes"><p>{program02.works[0].composerNote}</p><p>{program02.works[0].workNote}</p></div>
        </Reveal>

        <Reveal as="section" className="sanjo-detail__artists sanjo-detail__section" aria-labelledby="sanjo-artists-title">
          <p className="sanjo-detail__label">GUEST ARTISTS</p><h2 id="sanjo-artists-title">객원 연주자</h2>
          <div className="sanjo-detail__artist-grid">{performance.collaborators.map((artist) => <button className="sanjo-detail__artist" type="button" key={artist.id} onClick={(event) => { lastArtistButton.current = event.currentTarget; setSelectedArtist(artist); }}><span><SafeImage src={assetUrl(artist.image)} alt={`${artist.name} ${artist.role} 사진`} fallbackClassName="safe-image-fallback" fallbackLabel={`${artist.role} ${artist.name}`} objectPosition={artist.id === 'kim-na-young' ? 'center center' : 'center top'} /></span><small>{artist.role}</small><strong>{artist.name}</strong><em>VIEW PROFILE</em></button>)}</div>
        </Reveal>

        <Reveal as="section" className="sanjo-detail__info sanjo-detail__section" aria-labelledby="sanjo-info-title"><p className="sanjo-detail__label">INFORMATION</p><h2 id="sanjo-info-title">안내</h2><dl><div><dt>일시</dt><dd>{performance.displayDate}</dd></div><div><dt>장소</dt><dd>{performance.venue}</dd></div></dl></Reveal>
        <Reveal as="section" className="sanjo-detail__print sanjo-detail__section" aria-labelledby="sanjo-print-title"><p className="sanjo-detail__label">PRINT ARCHIVE</p><h2 id="sanjo-print-title">인쇄 아카이브</h2><div>{performance.archiveMaterials?.map((m) => <span key={m.label}>{m.label}</span>)}</div></Reveal>
        <nav className="sanjo-detail__bottom" aria-label="공연 상세 내비게이션"><Link to="/performance">← BACK TO PERFORMANCE</Link>{previousPerformance && <Link to={`/performance/${previousPerformance.id}`}><span>PREVIOUS PERFORMANCE</span><strong>{previousPerformance.title} →</strong></Link>}</nav>

        {selectedArtist && <div className="performance-detail__panel-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedArtist(null); }}><aside className="performance-detail__artist-panel" role="dialog" aria-modal="true" aria-labelledby="artist-panel-title" tabIndex={-1} ref={panelRef}><button className="performance-detail__panel-close" type="button" onClick={() => setSelectedArtist(null)}>CLOSE</button><div className="performance-detail__panel-photo"><SafeImage src={assetUrl(selectedArtist.image)} alt={`${selectedArtist.name} ${selectedArtist.role} 사진`} fallbackClassName="safe-image-fallback" fallbackLabel={`${selectedArtist.role} ${selectedArtist.name}`} objectPosition="center top" /></div><p>{selectedArtist.role}</p><h2 id="artist-panel-title">{selectedArtist.name}</h2><ul>{selectedArtist.fullBio.map((bio) => <li key={bio}>{bio}</li>)}</ul><h3>PARTICIPATING WORKS</h3><ol>{selectedArtist.participatingWorks.map((work) => <li key={work}>{work}</li>)}</ol><nav><button type="button" onClick={() => setSelectedArtist(performance.collaborators[(activeArtistIndex - 1 + performance.collaborators.length) % performance.collaborators.length])}>← PREV</button><button type="button" onClick={() => setSelectedArtist(performance.collaborators[(activeArtistIndex + 1) % performance.collaborators.length])}>NEXT →</button></nav></aside></div>}
      </article>
    );
  }

  const visibleMaterials = performance.archiveMaterials?.filter((material) => material.viewUrl || material.downloadUrl) ?? [];
  const activeWork = selectedWork ?? works[0];
  const heroPreview = performance.posterPreviewImageUrl ?? performance.posterImage;
  const heroImage = assetUrl(heroPreview ?? performance.heroImage);
  const heroAlt = heroPreview ? `${performance.title} 포스터` : `${performance.title} 공연 대표 이미지`;
  const leafletPreviewImages = performance.leafletPreviewImages ?? [];
  const posterPreviewImage = performance.posterPreviewImageUrl;
  const archivePreviews: Partial<Record<ArchiveMaterial['label'], ArchivePreview>> = {
    ...(posterPreviewImage ? {
      POSTER: {
        label: 'POSTER',
        closeLabel: '포스터 뷰어 닫기',
        images: [{ src: posterPreviewImage, alt: '해금, 시대를 잇다 공연 포스터' }],
      },
    } : {}),
    ...(leafletPreviewImages.length > 0 ? {
      LEAFLET: {
        label: 'LEAFLET',
        closeLabel: '리플렛 뷰어 닫기',
        images: leafletPreviewImages,
      },
    } : {}),
  };
  const openArchivePreview = (preview: ArchivePreview, button: HTMLButtonElement) => {
    lastArchivePreviewButton.current = button;
    setSelectedArchivePreview(preview);
  };
  const renderArchiveViewAction = (material: ArchiveMaterial) => {
    if (!material.viewUrl) return null;
    const preview = archivePreviews[material.label];
    if (preview) {
      return <button type="button" onClick={(event) => openArchivePreview(preview, event.currentTarget)}>{material.viewLabel}</button>;
    }
    return <a href={assetUrl(material.viewUrl)} target="_blank" rel="noreferrer" aria-label={`${performance.title} ${material.label === 'POSTER' ? '포스터' : '리플렛'} 새 창에서 보기`}>{material.viewLabel}</a>;
  };

  const renderWorkNote = (work: ProgramWork) => (
    <article className="performance-detail__work-notes" key={work.number}>
      <p className="performance-detail__work-index">{work.year}</p>
      <h3>{work.composer} <span>{work.composerYears}</span> | 「{work.title}」</h3>
      <div><h4>COMPOSER</h4><p>{work.composerNote}</p></div>
      <div><h4>WORK NOTE</h4><p>{work.workNote}</p></div>
      <div><h4>ENSEMBLE</h4><p>{work.instrumentation?.join(' · ') ?? '해금: 조윤경'}</p></div>
    </article>
  );

  return (
    <article className="performance-detail">
      <section className="performance-detail__hero" aria-labelledby="performance-title">
        <Link className="performance-detail__back" to="/performance"><span aria-hidden="true">←</span>BACK TO PERFORMANCES</Link>
        <div className="performance-detail__poster"><SafeImage src={heroImage} alt={heroAlt} fallbackClassName="safe-image-fallback" fallbackLabel={performance.title} /></div>
        <div className="performance-detail__hero-content">
          <p className="performance-detail__eyebrow">{performance.archiveLabel}</p>
          <h1 id="performance-title" aria-label={performance.title}><span>해금,</span><span>시대를 잇다</span></h1>
          <p className="performance-detail__subtitle">{performance.subtitle}</p>
          <dl className="performance-detail__meta" aria-label="공연 기본 정보"><div><dt>DATE</dt><dd>{performance.displayDate}</dd></div><div><dt>VENUE</dt><dd><span className="performance-detail__venue-name">{performance.venue}</span>{performance.venueAddress && <span className="performance-detail__venue-address">{performance.venueAddress}</span>}{performance.venueUrl && <a className="performance-detail__venue-link" href={performance.venueUrl} target="_blank" rel="noopener noreferrer" aria-label="향사아트센터 공식 홈페이지 새 창에서 열기">VISIT VENUE WEBSITE <span aria-hidden="true">↗</span></a>}</dd></div><div><dt>ARTIST</dt><dd><Link to="/about">{performance.performer}</Link></dd></div></dl>
          {visibleMaterials.length > 0 && <div className="performance-detail__hero-actions">{visibleMaterials.map((material) => <span key={material.label}>{renderArchiveViewAction(material)}</span>)}</div>}
        </div>
      </section>

      <div className="performance-detail__body">
        <div className="performance-detail__light-sections">
          <Reveal as="section" className="performance-detail__section" aria-labelledby="intro-title"><div className="performance-detail__section-heading reveal__heading"><span>01</span><h2 id="intro-title">ABOUT</h2></div><div className="performance-detail__prose reveal__content">{performance.introduction.map((p) => <p key={p}>{p}</p>)}</div></Reveal>
          <Reveal as="section" className="performance-detail__section performance-detail__note" aria-labelledby="note-title"><div className="performance-detail__section-heading reveal__heading"><span>02</span><h2 id="note-title">ARTIST’S NOTE</h2></div><blockquote className="performance-detail__prose reveal__content">{performance.artistNote.map((p) => <p key={p}>{p}</p>)}<cite>{performance.artistSignature}</cite></blockquote></Reveal>
        </div>
        <div className="performance-detail__dark-sections">
          <Reveal as="section" className="performance-detail__section" aria-labelledby="program-title"><div className="performance-detail__section-heading reveal__heading"><span>03</span><h2 id="program-title">PROGRAM</h2></div><div className="performance-detail__program reveal__content"><div className="performance-detail__timeline">{works.map((work) => <button className={activeWork?.number === work.number ? 'is-active' : ''} type="button" key={work.number} aria-pressed={activeWork?.number === work.number} onClick={() => { setSelectedWork(work); setShowAllNotes(false); }}><span>{work.year}</span><strong>{String(work.number).padStart(2, '0')}</strong><b>{work.title}</b><small>{work.composer}</small><em>{work.instrumentation?.join(' · ') ?? '해금 독주'}</em></button>)}</div><button className="performance-detail__all-notes" type="button" aria-expanded={showAllNotes} onClick={() => setShowAllNotes((value) => !value)}>{showAllNotes ? '선택한 곡만 보기' : '전체 곡 해설 보기'}</button><div className="performance-detail__notes-list">{showAllNotes ? works.map(renderWorkNote) : activeWork && renderWorkNote(activeWork)}</div></div></Reveal>
          <Reveal as="section" className="performance-detail__section" aria-labelledby="artists-title"><div className="performance-detail__section-heading reveal__heading"><span>04</span><h2 id="artists-title" aria-label="GUEST ARTISTS"><span>GUEST</span><span>ARTISTS</span></h2></div><div className="performance-detail__artists reveal__content">{performance.collaborators.map((artist) => <button className="performance-detail__artist" type="button" key={artist.id} onClick={(event) => { lastArtistButton.current = event.currentTarget; setSelectedArtist(artist); }}><span className="performance-detail__artist-photo"><SafeImage src={assetUrl(artist.image)} alt={`${artist.name} ${artist.role} 사진`} fallbackClassName="safe-image-fallback" fallbackLabel={`${artist.role} ${artist.name}`} objectPosition="center top" /></span><small>{artist.role}</small><strong>{artist.name}</strong><em>VIEW PROFILE</em></button>)}</div></Reveal>
          {visibleMaterials.length > 0 && <Reveal as="section" className="performance-detail__section" aria-labelledby="materials-title"><div className="performance-detail__section-heading reveal__heading"><span>05</span><h2 id="materials-title">ARCHIVE MATERIALS</h2></div><div className="performance-detail__materials reveal__content">{visibleMaterials.map((material) => <article className="performance-detail__material" key={material.label}><p>{material.label}</p><div>{renderArchiveViewAction(material)}{material.downloadUrl && <a href={assetUrl(material.downloadUrl)} download aria-label={`${performance.title} ${material.label === 'POSTER' ? '포스터 PNG' : '리플렛 PDF'} 다운로드`}>{material.downloadLabel ?? 'DOWNLOAD PDF'}</a>}</div></article>)}</div></Reveal>}
        </div>
      </div>

      {selectedArchivePreview && <div className="performance-detail__archive-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedArchivePreview(null); }}><div className={`performance-detail__archive-viewer performance-detail__archive-viewer--${selectedArchivePreview.label.toLowerCase()}`} role="dialog" aria-modal="true" aria-labelledby="archive-viewer-title" tabIndex={-1} ref={archiveViewerRef}><header><p id="archive-viewer-title">{selectedArchivePreview.label}</p><button type="button" aria-label={selectedArchivePreview.closeLabel} onClick={() => setSelectedArchivePreview(null)}>CLOSE</button></header><div className="performance-detail__archive-images">{selectedArchivePreview.images.map((image) => <figure key={image.src}>{image.label && <figcaption>{image.label}</figcaption>}<SafeImage src={assetUrl(image.src)} alt={image.alt} fallbackClassName="safe-image-fallback" fallbackLabel={image.label ?? selectedArchivePreview.label} /></figure>)}</div></div></div>}

      {selectedArtist && <div className="performance-detail__panel-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedArtist(null); }}><aside className="performance-detail__artist-panel" role="dialog" aria-modal="true" aria-labelledby="artist-panel-title" tabIndex={-1} ref={panelRef}><button className="performance-detail__panel-close" type="button" onClick={() => setSelectedArtist(null)}>CLOSE</button><div className="performance-detail__panel-photo"><SafeImage src={assetUrl(selectedArtist.image)} alt={`${selectedArtist.name} ${selectedArtist.role} 사진`} fallbackClassName="safe-image-fallback" fallbackLabel={`${selectedArtist.role} ${selectedArtist.name}`} objectPosition="center top" /></div><p>{selectedArtist.role}</p><h2 id="artist-panel-title">{selectedArtist.name}</h2><ul>{selectedArtist.fullBio.map((bio) => <li key={bio}>{bio}</li>)}</ul><h3>PARTICIPATING WORKS</h3><ol>{selectedArtist.participatingWorks.map((work) => <li key={work}>{work}</li>)}</ol><nav><button type="button" onClick={() => setSelectedArtist(performance.collaborators[(activeArtistIndex - 1 + performance.collaborators.length) % performance.collaborators.length])}>← PREV</button><button type="button" onClick={() => setSelectedArtist(performance.collaborators[(activeArtistIndex + 1) % performance.collaborators.length])}>NEXT →</button></nav></aside></div>}
    </article>
  );
}
