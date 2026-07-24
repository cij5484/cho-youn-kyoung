import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArtistProfilePanel } from '../components/performance/ArtistProfilePanel';
import { PerformanceBackLink } from '../components/performance/PerformanceBackLink';
import { ArchiveViewer } from '../components/performance/PerformanceArchive';
import { useArchiveViewer } from '../components/performance/useArchiveViewer';
import { PerformanceAdjacentNavigation } from '../components/performance/PerformanceAdjacentNavigation';
import { SanjoGil20260816Page } from './SanjoGil20260816Page';
import { SafeImage } from '../components/common/SafeImage';
import { Reveal } from '../components/Reveal';
import { performances, type PerformanceCollaborator, type ProgramWork } from '../data/performances';
import { assetUrl } from '../utils/assetUrl';
import '../styles/performance-detail.css';
import '../styles/archive-viewer.css';
import '../styles/performance-adjacent.css';



const flattenWorks = (performance: (typeof performances)[number]) => performance.programEras.flatMap((era) => era.works);

export function PerformanceDetailPage() {
  const { id } = useParams();
  const performance = performances.find((item) => item.id === id);
  const [selectedWork, setSelectedWork] = useState<ProgramWork | null>(null);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<PerformanceCollaborator | null>(null);
  const lastArtistButton = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const archiveViewer = useArchiveViewer();

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

  if (!performance) {
    return <section className="page-shell"><h1>Performance not found</h1><Link className="text-link" to="/performance">Back to performance</Link></section>;
  }

  if (performance.id === 'sanjo-gil-2026-08-16') {
    return <SanjoGil20260816Page performance={performance} />;
  }

  const activeWork = selectedWork ?? works[0];
  const visibleMaterials = performance.archiveMaterials ?? [];
  const posterMaterial = visibleMaterials.find((material) => material.label === 'POSTER');
  const posterPreview = posterMaterial?.previewImages[0];
  const heroImage = assetUrl(posterPreview?.src ?? performance.heroImage);
  const heroAlt = posterPreview ? `${performance.title} 포스터` : `${performance.title} 공연 대표 이미지`;

  const getMaterialName = (label: string) => (label === 'POSTER' ? '포스터' : '리플렛');
  const getDownloadType = (material: (typeof visibleMaterials)[number]) => {
    if (material.downloadLabel?.includes('PNG')) return 'PNG';
    if (material.downloadLabel?.includes('PDF')) return 'PDF';
    const extension = material.downloadUrl?.split('.').pop()?.toUpperCase();
    return extension || '자료';
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
        <PerformanceBackLink className="performance-detail__back" tone="gold" />
        <div className="performance-detail__poster"><SafeImage src={heroImage} alt={heroAlt} fallbackClassName="safe-image-fallback" fallbackLabel={performance.title} /></div>
        <div className="performance-detail__hero-content">
          <p className="performance-detail__eyebrow">{performance.archiveLabel}</p>
          <h1 id="performance-title" aria-label={performance.title}><span>해금,</span><span>시대를 잇다</span></h1>
          <p className="performance-detail__subtitle">{performance.subtitle}</p>
          <dl className="performance-detail__meta" aria-label="공연 기본 정보"><div><dt>DATE</dt><dd>{performance.displayDate}</dd></div><div><dt>VENUE</dt><dd><span className="performance-detail__venue-name">{performance.venue}</span>{performance.venueAddress && <span className="performance-detail__venue-address">{performance.venueAddress}</span>}{performance.venueUrl && <a className="performance-detail__venue-link" href={performance.venueUrl} target="_blank" rel="noopener noreferrer" aria-label="향사아트센터 공식 홈페이지 새 창에서 열기">VISIT VENUE WEBSITE <span aria-hidden="true">↗</span></a>}</dd></div><div><dt>ARTIST</dt><dd><Link to="/about">{performance.performer}</Link></dd></div></dl>
          {visibleMaterials.length > 0 && <div className="performance-detail__hero-actions">{visibleMaterials.map((material) => material.previewImages.length > 0 ? <span key={material.label}><button type="button" aria-label={`${performance.title} ${getMaterialName(material.label)} 확대 보기`} onClick={(event) => archiveViewer.openMaterial(material, event.currentTarget)}>{material.viewLabel}</button></span> : null)}</div>}
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
          {visibleMaterials.length > 0 && <Reveal as="section" className="performance-detail__section" aria-labelledby="materials-title"><div className="performance-detail__section-heading reveal__heading"><span>05</span><h2 id="materials-title">ARCHIVE MATERIALS</h2></div><div className="performance-detail__materials reveal__content">{visibleMaterials.map((material) => <article className="performance-detail__material" key={material.label}><p>{material.label}</p><div>{material.previewImages.length > 0 && <button type="button" aria-label={`${performance.title} ${getMaterialName(material.label)} 확대 보기`} onClick={(event) => archiveViewer.openMaterial(material, event.currentTarget)}>{material.viewLabel}</button>}{material.downloadUrl && <a href={assetUrl(material.downloadUrl)} download aria-label={`${performance.title} ${getMaterialName(material.label)} ${getDownloadType(material)} 다운로드`}>{material.downloadLabel ?? `DOWNLOAD ${getDownloadType(material)}`}</a>}</div></article>)}</div></Reveal>}
        </div>
      </div>

      <ArchiveViewer activeMaterial={archiveViewer.activeMaterial} closeMaterial={archiveViewer.closeMaterial} lastTriggerRef={archiveViewer.lastTriggerRef} tone="gold" />

      <PerformanceAdjacentNavigation currentId={performance.id} tone="gold" />

      {selectedArtist && <ArtistProfilePanel artist={selectedArtist} artists={performance.collaborators} activeIndex={activeArtistIndex} panelRef={panelRef} onClose={() => setSelectedArtist(null)} onSelect={setSelectedArtist} tone="gold" />}
    </article>
  );
}
