import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { performances, type PerformanceCollaborator, type ProgramWork } from '../data/performances';
import { assetUrl } from '../utils/assetUrl';
import '../styles/performance-detail.css';

const flattenWorks = (performance: (typeof performances)[number]) => performance.programEras.flatMap((era) => era.works);

export function PerformanceDetailPage() {
  const { id } = useParams();
  const performance = performances.find((item) => item.id === id);
  const [selectedWork, setSelectedWork] = useState<ProgramWork | null>(null);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<PerformanceCollaborator | null>(null);
  const lastArtistButton = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const works = useMemo(() => (performance ? flattenWorks(performance) : []), [performance]);

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

  const visibleMaterials = performance.archiveMaterials?.filter((material) => material.url || material.previewImageUrl) ?? [];
  const activeWork = selectedWork ?? works[0];
  const activeArtistIndex = selectedArtist ? performance.collaborators.findIndex((artist) => artist.id === selectedArtist.id) : -1;
  const heroPreview = performance.posterPreviewImageUrl ?? performance.posterImage;
  const heroImage = assetUrl(heroPreview ?? performance.heroImage);
  const heroAlt = heroPreview ? `${performance.title} 포스터` : `${performance.title} 공연 대표 이미지`;

  const renderWorkNote = (work: ProgramWork) => (
    <article className="performance-detail__work-notes" key={work.number}>
      <p className="performance-detail__work-index">{work.year} · {String(work.number).padStart(2, '0')}</p>
      <h3>{work.composer}({work.composerYears}) 「{work.title}」</h3>
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
          <h1 id="performance-title">{performance.title}</h1>
          <p className="performance-detail__subtitle">{performance.subtitle}</p>
          <dl className="performance-detail__meta" aria-label="공연 기본 정보"><div><dt>DATE</dt><dd>{performance.displayDate}</dd></div><div><dt>VENUE</dt><dd>{performance.venue}</dd></div><div><dt>ARTIST</dt><dd><Link to="/about">{performance.performer}</Link></dd></div></dl>
          {visibleMaterials.length > 0 && <div className="performance-detail__hero-actions">{visibleMaterials.map((material) => material.url && <a key={material.label} href={assetUrl(material.url)} target="_blank" rel="noreferrer">{material.viewLabel}</a>)}</div>}
        </div>
      </section>

      <div className="performance-detail__body">
        <div className="performance-detail__light-sections">
          <section className="performance-detail__section" aria-labelledby="intro-title"><div className="performance-detail__section-heading"><span>01</span><h2 id="intro-title">ABOUT</h2></div><div className="performance-detail__prose">{performance.introduction.map((p) => <p key={p}>{p}</p>)}</div></section>
          <section className="performance-detail__section performance-detail__note" aria-labelledby="note-title"><div className="performance-detail__section-heading"><span>02</span><h2 id="note-title">ARTIST’S NOTE</h2></div><blockquote className="performance-detail__prose">{performance.artistNote.map((p) => <p key={p}>{p}</p>)}<cite>{performance.artistSignature}</cite></blockquote></section>
        </div>
        <div className="performance-detail__dark-sections">
          <section className="performance-detail__section" aria-labelledby="program-title"><div className="performance-detail__section-heading"><span>03</span><h2 id="program-title">PROGRAM</h2></div><div className="performance-detail__program"><div className="performance-detail__timeline">{works.map((work) => <button className={activeWork?.number === work.number ? 'is-active' : ''} type="button" key={work.number} aria-pressed={activeWork?.number === work.number} onClick={() => { setSelectedWork(work); setShowAllNotes(false); }}><span>{work.year}</span><strong>{String(work.number).padStart(2, '0')}</strong><b>{work.title}</b><small>{work.composer}</small><em>{work.instrumentation?.join(' · ') ?? '해금 독주'}</em></button>)}</div><button className="performance-detail__all-notes" type="button" aria-expanded={showAllNotes} onClick={() => setShowAllNotes((value) => !value)}>{showAllNotes ? '선택한 곡만 보기' : '전체 곡 해설 보기'}</button><div className="performance-detail__notes-list">{showAllNotes ? works.map(renderWorkNote) : activeWork && renderWorkNote(activeWork)}</div></div></section>
          <section className="performance-detail__section" aria-labelledby="collaborator-title"><div className="performance-detail__section-heading"><span>04</span><h2 id="collaborator-title">COLLABORATING ARTISTS</h2></div><div className="performance-detail__artists">{performance.collaborators.map((artist) => <button className="performance-detail__artist" type="button" key={artist.id} onClick={(event) => { lastArtistButton.current = event.currentTarget; setSelectedArtist(artist); }}><span className="performance-detail__artist-photo"><SafeImage src={assetUrl(artist.image)} alt={`${artist.name} ${artist.role} 사진`} fallbackClassName="safe-image-fallback" fallbackLabel={`${artist.role} ${artist.name}`} objectPosition="center top" /></span><small>{artist.role}</small><strong>{artist.name}</strong><p>{artist.shortBio}</p><em>VIEW PROFILE</em></button>)}</div></section>
          {visibleMaterials.length > 0 && <section className="performance-detail__section" aria-labelledby="materials-title"><div className="performance-detail__section-heading"><span>05</span><h2 id="materials-title">ARCHIVE MATERIALS</h2></div><div className="performance-detail__materials">{visibleMaterials.map((material) => <article className="performance-detail__material" key={material.label}>{material.previewImageUrl && <SafeImage src={assetUrl(material.previewImageUrl)} alt={`${material.label} preview`} /> }<p>{material.label}</p>{material.url && <a href={assetUrl(material.url)} target="_blank" rel="noreferrer">VIEW PDF</a>}{material.downloadUrl && <a href={assetUrl(material.downloadUrl)} download>DOWNLOAD PDF</a>}</article>)}</div></section>}
        </div>
      </div>

      {selectedArtist && <div className="performance-detail__panel-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedArtist(null); }}><aside className="performance-detail__artist-panel" role="dialog" aria-modal="true" aria-labelledby="artist-panel-title" tabIndex={-1} ref={panelRef}><button className="performance-detail__panel-close" type="button" onClick={() => setSelectedArtist(null)}>CLOSE</button><div className="performance-detail__panel-photo"><SafeImage src={assetUrl(selectedArtist.image)} alt={`${selectedArtist.name} ${selectedArtist.role} 사진`} fallbackClassName="safe-image-fallback" fallbackLabel={`${selectedArtist.role} ${selectedArtist.name}`} objectPosition="center top" /></div><p>{selectedArtist.role}</p><h2 id="artist-panel-title">{selectedArtist.name}</h2><ul>{selectedArtist.fullBio.map((bio) => <li key={bio}>{bio}</li>)}</ul><h3>PARTICIPATING WORKS</h3><ol>{selectedArtist.participatingWorks.map((work) => <li key={work}>{work}</li>)}</ol><nav><button type="button" onClick={() => setSelectedArtist(performance.collaborators[(activeArtistIndex - 1 + performance.collaborators.length) % performance.collaborators.length])}>← PREV</button><button type="button" onClick={() => setSelectedArtist(performance.collaborators[(activeArtistIndex + 1) % performance.collaborators.length])}>NEXT →</button></nav></aside></div>}
    </article>
  );
}
