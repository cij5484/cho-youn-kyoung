import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { SafeImage } from '../components/common/SafeImage';
import { ArtistProfilePanel } from '../components/performance/ArtistProfilePanel';
import { PerformanceBackLink } from '../components/performance/PerformanceBackLink';
import { performances, type Performance, type PerformanceCollaborator } from '../data/performances';
import { assetUrl } from '../utils/assetUrl';
import '../styles/sanjo-detail.css';

export function SanjoGil20260816Page({ performance }: { performance: Performance }) {
  const [selectedArtist, setSelectedArtist] = useState<PerformanceCollaborator | null>(null);
  const lastArtistButton = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [program01, program02] = performance.programEras;
  const previousPerformance = performances.find((item) => item.id === 'haegeum-2026-08-02');
  const activeArtistIndex = selectedArtist ? performance.collaborators.findIndex((artist) => artist.id === selectedArtist.id) : -1;

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

  return (
    <article className="sanjo-detail">
      <section className="sanjo-detail__hero" aria-labelledby="sanjo-detail-title">
        <div className="sanjo-detail__hero-copy">
          <PerformanceBackLink className="sanjo-detail__back" tone="navy" />
          <p className="sanjo-detail__eyebrow">SANJO-GIL PROJECT 02</p>
          <h1 id="sanjo-detail-title"><span>산조길,</span><strong>둘</strong></h1>
          <p className="sanjo-detail__subtitle">{performance.subtitle}</p>
          <p className="sanjo-detail__date"><span>2026.</span><strong>8. 16.</strong><span>SUN 15:30</span></p>
          <p className="sanjo-detail__venue">{performance.venue}</p>
        </div>
        <div className="sanjo-detail__matiere-layer" aria-hidden="true"><div className="sanjo-detail__orb" /></div>
      </section>

      <section className="sanjo-detail__quick" aria-label="공연 기본 정보">
        {[['DATE','2026. 8. 16. (일) 15:30'],['VENUE','해운대문화회관 고운홀'],['RUNNING TIME','약 60분 · 인터미션 없음'],['TICKET','전석 10,000원'],['ADMISSION','현장 발권 · 자유석\n미취학 아동 관람 불가']].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value.split('\n').map((line)=><span key={line}>{line}</span>)}</dd></div>)}
      </section>

      <Reveal as="section" className="sanjo-detail__note sanjo-detail__section" aria-labelledby="sanjo-note-title">
        <p className="sanjo-detail__label" id="sanjo-note-title">ARTIST’S NOTE</p>
        <p className="sanjo-detail__lead">{performance.artistNote[0]}</p>
        <blockquote>{performance.artistNote.slice(1).map((note) => <p key={note}>{note}</p>)}<cite>{performance.artistSignature}</cite></blockquote>
      </Reveal>

      <ProgramBand tone="light" number="01" title="PROGRAM 01" workTitle={program01.title} lines={program01.works[0].instrumentation ?? []} notes={[program01.works[0].composerNote, program01.works[0].workNote]} />
      <ProgramBand tone="dark" number="02" title="PROGRAM 02" workTitle={program02.title} lines={[...(program02.works[0].instrumentation ?? []), program02.description]} notes={[program02.works[0].composerNote, program02.works[0].workNote]} />

      <Reveal as="section" className="sanjo-detail__artists sanjo-detail__section" aria-labelledby="sanjo-artists-title">
        <p className="sanjo-detail__label" id="sanjo-artists-title">GUEST ARTISTS</p>
        <div className="sanjo-detail__artist-grid">{performance.collaborators.map((artist) => <button className="sanjo-detail__artist" type="button" key={artist.id} onClick={(event) => { lastArtistButton.current = event.currentTarget; setSelectedArtist(artist); }}><span><SafeImage src={assetUrl(artist.image)} alt={`${artist.name} ${artist.role} 사진`} fallbackClassName="safe-image-fallback" fallbackLabel={`${artist.role} ${artist.name}`} objectPosition={artist.id === 'kim-na-young' ? 'center center' : 'center top'} /></span><small>{artist.role}</small><strong>{artist.name}</strong><em>VIEW PROFILE</em></button>)}</div>
      </Reveal>

      <section className="sanjo-detail__info sanjo-detail__section" aria-labelledby="sanjo-info-title"><p className="sanjo-detail__label" id="sanjo-info-title">INFORMATION</p><dl>{['일시|2026. 8. 16. (일) 15:30','장소|해운대문화회관 고운홀','관람료|전석 10,000원','공연시간|약 60분 · 인터미션 없음','현장 발권|당일 현장 발권','자유석|전석 자유석','관람 연령|미취학 아동 관람 불가'].map((item)=>{const [k,v]=item.split('|'); return <div key={k}><dt>{k}</dt><dd>{v}</dd></div>;})}</dl></section>
      <section className="sanjo-detail__print" aria-labelledby="sanjo-print-title"><p className="sanjo-detail__label" id="sanjo-print-title">PRINT ARCHIVE</p><div>{performance.archiveMaterials?.map((m) => <span key={m.label}>{m.label}</span>)}</div></section>
      <nav className="sanjo-detail__bottom" aria-label="공연 상세 내비게이션"><PerformanceBackLink tone="navy" />{previousPerformance && <Link to={`/performance/${previousPerformance.id}`}><span>PREVIOUS PERFORMANCE</span><strong>{previousPerformance.title} →</strong></Link>}</nav>
      {selectedArtist && <ArtistProfilePanel artist={selectedArtist} artists={performance.collaborators} activeIndex={activeArtistIndex} panelRef={panelRef} onClose={() => setSelectedArtist(null)} onSelect={setSelectedArtist} />}
    </article>
  );
}

function ProgramBand({ tone, number, title, workTitle, lines, notes }: { tone: 'light' | 'dark'; number: string; title: string; workTitle: string; lines: string[]; notes: string[] }) {
  return <Reveal as="section" className={`sanjo-program sanjo-program--${tone}`} aria-labelledby={`sanjo-program-${number}`}><span className="sanjo-program__ghost">{number}</span><div className="sanjo-program__side"><p>{title}</p><h2 id={`sanjo-program-${number}`}>{workTitle}</h2><ul>{lines.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="sanjo-program__notes">{notes.map((note) => <p key={note}>{note}</p>)}</div></Reveal>;
}
