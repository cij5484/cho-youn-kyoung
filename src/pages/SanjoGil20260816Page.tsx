import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { SafeImage } from '../components/common/SafeImage';
import { ArtistProfilePanel } from '../components/performance/ArtistProfilePanel';
import { PerformanceBackLink } from '../components/performance/PerformanceBackLink';
import { ArchiveViewer } from '../components/performance/PerformanceArchive';
import { useArchiveViewer } from '../components/performance/useArchiveViewer';
import { getAdjacentPerformances } from '../utils/performanceNavigation';
import { type Performance, type PerformanceCollaborator } from '../data/performances';
import { assetUrl } from '../utils/assetUrl';
import '../styles/sanjo-detail.css';

const formatSanjoHeroDate = (performance: Performance) => {
  const [year, month, day] = performance.date.split('-').map(Number);
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', weekday: 'short' })
    .format(new Date(`${performance.date}T00:00:00+09:00`))
    .toUpperCase();
  const time = performance.displayDate.trim().split(/\s+/).at(-1) ?? '';

  return { yearLabel: `${year}.`, monthDayLabel: `${month}. ${day}.`, weekdayTimeLabel: `${weekday} ${time}` };
};

const quickInformationItems = (performance: Performance) => [
  { label: 'DATE', value: performance.displayDate },
  { label: 'VENUE', value: performance.venue, address: performance.venueAddress, url: performance.venueUrl, wide: true },
  { label: 'RUNNING TIME', value: performance.runningTime },
  { label: 'TICKET', value: performance.ticketPrice },
  { label: 'TICKETING', value: performance.ticketing },
  { label: 'SEATING', value: performance.seating },
  { label: 'AGE RESTRICTION', value: performance.ageRestriction },
];

const downloadTypeLabel = (url: string) => url.split('.').pop()?.toUpperCase() ?? 'FILE';

export function SanjoGil20260816Page({ performance }: { performance: Performance }) {
  const [selectedArtist, setSelectedArtist] = useState<PerformanceCollaborator | null>(null);
  const lastArtistButton = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [program01, program02] = performance.programEras;
  const archiveViewer = useArchiveViewer();
  const { previous } = getAdjacentPerformances(performance.id);
  const activeArtistIndex = selectedArtist ? performance.collaborators.findIndex((artist) => artist.id === selectedArtist.id) : -1;
  const heroDate = formatSanjoHeroDate(performance);

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
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      lastArtistButton.current?.focus();
    };
  }, [selectedArtist]);

  return (
    <article className="sanjo-detail">
      <section className="sanjo-detail__hero" aria-labelledby="sanjo-detail-title">
        <div className="sanjo-detail__hero-copy">
          <PerformanceBackLink className="sanjo-detail__back" tone="navy" />
          <p className="sanjo-detail__eyebrow">SANJO-GIL PROJECT 02</p>
          <h1 id="sanjo-detail-title"><span>산조길,</span><strong>둘</strong></h1>
          <p className="sanjo-detail__subtitle">{performance.subtitle}</p>
          <p className="sanjo-detail__date"><span>{heroDate.yearLabel}</span><strong>{heroDate.monthDayLabel}</strong><span>{heroDate.weekdayTimeLabel}</span></p>
        </div>
      </section>

      <div className="sanjo-detail__note-info">
        <section className="sanjo-detail__quick" aria-labelledby="sanjo-quick-title">
          <h2 className="sanjo-detail__section-title" id="sanjo-quick-title">QUICK INFORMATION</h2>
          <dl>
            {quickInformationItems(performance).map((item) => item.value ? (
              <div className={item.wide ? 'sanjo-detail__quick-item sanjo-detail__quick-item--wide' : 'sanjo-detail__quick-item'} key={item.label}>
                <dt>{item.label}</dt>
                <dd>
                  <span>{item.value}</span>
                  {item.address ? <address>{item.address}</address> : null}
                  {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">OFFICIAL WEBSITE <span aria-hidden="true">↗</span></a> : null}
                </dd>
              </div>
            ) : null)}
          </dl>
        </section>

        <Reveal as="section" className="sanjo-detail__note sanjo-detail__section" aria-labelledby="sanjo-note-title">
          <h2 className="sanjo-detail__section-title" id="sanjo-note-title">ARTIST’S NOTE</h2>
          <p className="sanjo-detail__lead">{performance.artistNote[0]}</p>
          <blockquote>{performance.artistNote.slice(1).map((note) => <p key={note}>{note}</p>)}<cite>{performance.artistSignature}</cite></blockquote>
        </Reveal>
      </div>

      <ProgramBand tone="light" number="01" title="PROGRAM 01" workTitle={program01.title} lines={program01.works[0].instrumentation ?? []} notes={[program01.works[0].composerNote, program01.works[0].workNote]} />
      <ProgramBand tone="dark" number="02" title="PROGRAM 02" workTitle={program02.title} lines={[...(program02.works[0].instrumentation ?? []), program02.description]} notes={[program02.works[0].composerNote, program02.works[0].workNote]} />

      <Reveal as="section" className="sanjo-detail__artists sanjo-detail__section" aria-labelledby="sanjo-artists-title">
        <h2 className="sanjo-detail__section-title" id="sanjo-artists-title">GUEST ARTISTS</h2>
        <div className="sanjo-detail__artist-grid">{performance.collaborators.map((artist) => <button className="sanjo-detail__artist" type="button" key={artist.id} onClick={(event) => { lastArtistButton.current = event.currentTarget; setSelectedArtist(artist); }}><span><SafeImage src={assetUrl(artist.image)} alt={`${artist.name} ${artist.role} 사진`} fallbackClassName="safe-image-fallback" fallbackLabel={`${artist.role} ${artist.name}`} objectPosition={artist.id === 'kim-na-young' ? 'center center' : 'center top'} /></span><small>{artist.role}</small><strong>{artist.name}</strong><em>VIEW PROFILE</em></button>)}</div>
      </Reveal>

      <div className="sanjo-detail__archive-bottom">
        <section className="sanjo-detail__archive sanjo-detail__section" aria-labelledby="sanjo-archive-title">
          <h2 className="sanjo-detail__section-title" id="sanjo-archive-title">ARCHIVE MATERIALS</h2>
          <div className="sanjo-detail__archive-materials">
            {performance.archiveMaterials?.map((material) => <article className="sanjo-detail__archive-material" key={material.label}><h3>{material.label}</h3><div>{material.previewImages.length > 0 && <button type="button" aria-label={`${performance.title} ${material.label === 'POSTER' ? '포스터' : '리플렛'} 확대 보기`} onClick={(event) => archiveViewer.openMaterial(material, event.currentTarget)}>{material.viewLabel}</button>}{material.downloadUrl && <a href={assetUrl(material.downloadUrl)} download aria-label={`${performance.title} ${material.label === 'POSTER' ? '포스터' : '리플렛'} ${downloadTypeLabel(material.downloadUrl)} 다운로드`}>{material.downloadLabel ?? `DOWNLOAD ${downloadTypeLabel(material.downloadUrl)}`}</a>}</div></article>)}
          </div>
        </section>
        <nav className="sanjo-detail__bottom" aria-label="공연 상세 내비게이션"><PerformanceBackLink tone="navy" />{previous && <Link className="sanjo-detail__bottom-link" to={`/performance/${previous.id}`}><span>PREVIOUS PERFORMANCE</span><strong>{previous.title} →</strong></Link>}</nav>
      </div>
      <ArchiveViewer activeMaterial={archiveViewer.activeMaterial} closeMaterial={archiveViewer.closeMaterial} lastTriggerRef={archiveViewer.lastTriggerRef} tone="navy" />
      {selectedArtist && <ArtistProfilePanel artist={selectedArtist} artists={performance.collaborators} activeIndex={activeArtistIndex} panelRef={panelRef} onClose={() => setSelectedArtist(null)} onSelect={setSelectedArtist} tone="navy" />}
    </article>
  );
}

function ProgramBand({ tone, number, title, workTitle, lines, notes }: { tone: 'light' | 'dark'; number: string; title: string; workTitle: string; lines: string[]; notes: string[] }) {
  return <Reveal as="section" className={`sanjo-program sanjo-program--${tone}`} aria-labelledby={`sanjo-program-${number}`}><span className="sanjo-program__ghost">{number}</span><div className="sanjo-program__side"><h2 className="sanjo-detail__section-title" id={`sanjo-program-${number}`}>{title}</h2><h3>{workTitle}</h3><ul>{lines.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="sanjo-program__notes">{notes.map((note) => <p key={note}>{note}</p>)}</div></Reveal>;
}
