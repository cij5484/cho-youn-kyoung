import { useEffect, useRef, useState } from 'react';
import { SafeImage } from '../components/common/SafeImage';
import { ArtistProfilePanel } from '../components/performance/ArtistProfilePanel';
import { ArchiveViewer } from '../components/performance/PerformanceArchive';
import { PerformanceAdjacentNavigation } from '../components/performance/PerformanceAdjacentNavigation';
import { PerformanceBackLink } from '../components/performance/PerformanceBackLink';
import { useArchiveViewer } from '../components/performance/useArchiveViewer';
import type { Performance, PerformanceCollaborator } from '../data/performances';
import { assetUrl } from '../utils/assetUrl';
import '../styles/haegeum-jeongak-detail.css';

export function HaegeumJeongak20260922Page({ performance }: { performance: Performance }) {
  const [selectedArtist, setSelectedArtist] = useState<PerformanceCollaborator | null>(null);
  const lastArtistButton = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const archiveViewer = useArchiveViewer();
  const poster = performance.archiveMaterials?.find((item) => item.label === 'POSTER');
  const programs = performance.programEras.map((era) => ({ era, work: era.works[0] }));
  const guestArtists = (performance.simpleCast ?? [])
    .filter((artist) => artist.role !== '해금')
    .map((artist) => ({ ...artist, profile: performance.collaborators.find((profile) => profile.name === artist.name) }));
  const activeArtistIndex = selectedArtist
    ? performance.collaborators.findIndex((artist) => artist.id === selectedArtist.id)
    : -1;
  const openButton = (label: 'POSTER' | 'LEAFLET') => {
    const material = performance.archiveMaterials?.find((item) => item.label === label);
    return material ? <button type="button" onClick={(event) => archiveViewer.openMaterial(material, event.currentTarget)}>{material.viewLabel}</button> : null;
  };
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    if (!selectedArtist) return;
    const previousOverflow = document.body.style.overflow;
    const panel = panelRef.current;
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    document.body.style.overflow = 'hidden';
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
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      lastArtistButton.current?.focus();
    };
  }, [selectedArtist]);

  return (
    <article className="hj-detail">
      <section className="hj-detail__hero" id="overview" aria-labelledby="hj-detail-title">
        <PerformanceBackLink className="hj-detail__back" tone="violet" />
        <div className="hj-detail__hero-art">
          <div className="hj-detail__poster"><SafeImage src={assetUrl(poster?.previewImages[0]?.src ?? performance.heroImage)} alt="풀고, 엮다 공연 포스터" fallbackClassName="safe-image-fallback" fallbackLabel={performance.title} /></div>
          <span className="hj-detail__edition" aria-hidden="true">RECITAL · BUSAN · 2026</span>
        </div>
        <div className="hj-detail__hero-copy">
          <p className="hj-detail__eyebrow">{performance.archiveLabel} · RECITAL</p>
          <h1 id="hj-detail-title"><span>풀고,</span><span>엮다</span></h1>
          <p className="hj-detail__subtitle"><span>조윤경의 해금정악</span><span>해금상령산풀이 · 관악영산회상</span></p>
          <div className="hj-detail__event" aria-label="공연 일시와 장소">
            <time className="hj-detail__date" dateTime={performance.date}><strong><span>09</span><i>.</i><span>22</span></strong><span>2026 · 화요일</span></time>
            <div className="hj-detail__venue"><strong>19:30</strong><p>{performance.venue}</p><small>{performance.venueAddress}</small></div>
          </div>
          <div className="hj-detail__attendance"><strong>{performance.performer}</strong><p>{performance.ticketPrice} · {performance.seating}</p><small>{performance.ageRestriction}</small></div>
          <div className="hj-detail__actions">{openButton('POSTER')}{openButton('LEAFLET')}</div>
        </div>
      </section>

      <nav className="hj-detail__section-nav" aria-label="공연 상세 섹션">
        <button className="hj-detail__section-nav-home" type="button" onClick={() => scrollToSection('overview')}><span>09.22</span><strong>풀고, 엮다</strong></button>
        <div>
          <button type="button" onClick={() => scrollToSection('artist-note')}><span>01</span>NOTE</button>
          <button type="button" onClick={() => scrollToSection('program')}><span>02</span>PROGRAM</button>
          <button type="button" onClick={() => scrollToSection('artists')}><span>03</span>ARTISTS</button>
          <button type="button" onClick={() => scrollToSection('archive')}><span>04</span>ARCHIVE</button>
        </div>
      </nav>

      <section className="hj-detail__section hj-detail__note" id="artist-note" aria-labelledby="hj-note-title">
        <header><span>01</span><h2 id="hj-note-title">ARTIST’S NOTE</h2></header>
        <blockquote>{performance.artistNote.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<cite>{performance.artistSignature}</cite></blockquote>
      </section>

      <section className="hj-detail__section hj-detail__program" id="program" aria-labelledby="hj-program-title">
        <header><span>02</span><h2 id="hj-program-title">PROGRAM</h2></header>
        <div className="hj-detail__programs">{programs.map(({ era, work }) => <article key={era.roman}><span className="hj-detail__program-number">{era.roman}</span><h3>{era.title}</h3>{era.description && <p className="hj-detail__sequence">{era.description}</p>}<ul>{work.instrumentation?.map((line) => <li key={line}>{line}</li>)}</ul><div className="hj-detail__program-note">
          <p>{work.composerNote}</p>
          {work.workNote
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
        </div></article>)}</div>
      </section>

      <section className="hj-detail__section hj-detail__artists" id="artists" aria-labelledby="hj-artists-title">
        <div className="hj-detail__section-art hj-detail__artists-art" aria-hidden="true"><SafeImage src={assetUrl(performance.heroImage)} alt="" loading="lazy" decoding="async" /></div>
        <header><span>03</span><h2 id="hj-artists-title">ARTISTS</h2></header>
        <div className="hj-detail__artist-grid">{guestArtists.map((artist) => artist.profile ? (
          <button className="hj-detail__artist" type="button" key={`${artist.role}-${artist.name}`} onClick={(event) => { lastArtistButton.current = event.currentTarget; setSelectedArtist(artist.profile ?? null); }}>
            <span className="hj-detail__artist-photo"><SafeImage src={assetUrl(artist.profile.image)} alt={`${artist.name} ${artist.role} 사진`} fallbackClassName="safe-image-fallback" fallbackLabel={`${artist.role} ${artist.name}`} objectPosition="center top" loading="lazy" decoding="async" /></span>
            <small>{artist.role}</small><strong>{artist.name}</strong><em>VIEW PROFILE</em>
          </button>
        ) : (
          <article className="hj-detail__artist" key={`${artist.role}-${artist.name}`}>
            <span className="hj-detail__artist-photo hj-detail__artist-photo--empty" aria-hidden="true" />
            <small>{artist.role}</small><strong>{artist.name}</strong>
          </article>
        ))}</div>
      </section>

      <section className="hj-detail__section hj-detail__archive" id="archive" aria-labelledby="hj-archive-title">
        <header><span>04</span><h2 id="hj-archive-title">ARCHIVE MATERIALS</h2></header>
        <div className="hj-detail__archive-list">{performance.archiveMaterials?.map((material) => <article key={material.label}>
          <div className="hj-detail__archive-copy"><strong>{material.label}</strong><small>{material.label === 'POSTER' ? '공연 포스터' : '4단 리플렛'}</small></div>
          <div className="hj-detail__archive-actions"><button type="button" aria-label={`${material.label} 자료 보기`} onClick={(event) => archiveViewer.openMaterial(material, event.currentTarget)}>{material.viewLabel}</button>{material.downloadUrl && <a href={assetUrl(material.downloadUrl)} aria-label={`${material.label} PDF 다운로드`} download>PDF <span aria-hidden="true">→</span></a>}</div>
        </article>)}</div>
      </section>
      <PerformanceAdjacentNavigation currentId={performance.id} tone="violet" />
      <ArchiveViewer activeMaterial={archiveViewer.activeMaterial} closeMaterial={archiveViewer.closeMaterial} lastTriggerRef={archiveViewer.lastTriggerRef} tone="violet" />
      {selectedArtist && <ArtistProfilePanel artist={selectedArtist} artists={performance.collaborators} activeIndex={activeArtistIndex} panelRef={panelRef} onClose={() => setSelectedArtist(null)} onSelect={setSelectedArtist} tone="violet" />}
    </article>
  );
}
