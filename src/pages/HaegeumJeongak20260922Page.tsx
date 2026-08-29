import { SafeImage } from '../components/common/SafeImage';
import { ArchiveViewer } from '../components/performance/PerformanceArchive';
import { PerformanceBackLink } from '../components/performance/PerformanceBackLink';
import { useArchiveViewer } from '../components/performance/useArchiveViewer';
import type { Performance } from '../data/performances';
import { assetUrl } from '../utils/assetUrl';
import '../styles/haegeum-jeongak-detail.css';

export function HaegeumJeongak20260922Page({ performance }: { performance: Performance }) {
  const archiveViewer = useArchiveViewer();
  const poster = performance.archiveMaterials?.find((item) => item.label === 'POSTER');
  const programs = performance.programEras.map((era) => ({ era, work: era.works[0] }));
  const openButton = (label: 'POSTER' | 'LEAFLET') => {
    const material = performance.archiveMaterials?.find((item) => item.label === label);
    return material ? <button type="button" onClick={(event) => archiveViewer.openMaterial(material, event.currentTarget)}>{material.viewLabel}</button> : null;
  };

  return (
    <article className="hj-detail">
      <section className="hj-detail__hero" aria-labelledby="hj-detail-title">
        <PerformanceBackLink className="hj-detail__back" tone="gold" />
        <div className="hj-detail__poster"><SafeImage src={assetUrl(poster?.previewImages[0]?.src ?? performance.heroImage)} alt="풀고, 엮다 공연 포스터" fallbackClassName="safe-image-fallback" fallbackLabel={performance.title} /></div>
        <div className="hj-detail__hero-copy">
          <p className="hj-detail__eyebrow">{performance.archiveLabel}</p>
          <h1 id="hj-detail-title">{performance.title}</h1>
          <p className="hj-detail__subtitle">{performance.subtitle}</p>
          <dl className="hj-detail__facts">
            <div><dt>DATE</dt><dd>{performance.displayDate}</dd></div>
            <div><dt>VENUE</dt><dd>{performance.venue}<small>{performance.venueAddress}</small></dd></div>
            <div><dt>ARTIST</dt><dd>{performance.performer}</dd></div>
            <div><dt>ADMISSION</dt><dd>{performance.ticketPrice} · {performance.seating}<small>{performance.ageRestriction}</small></dd></div>
          </dl>
          <div className="hj-detail__actions">{openButton('POSTER')}{openButton('LEAFLET')}</div>
        </div>
      </section>

      <section className="hj-detail__section hj-detail__note" aria-labelledby="hj-note-title">
        <header><span>01</span><h2 id="hj-note-title">ARTIST’S NOTE</h2></header>
        <blockquote>{performance.artistNote.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<cite>{performance.artistSignature}</cite></blockquote>
      </section>

      <section className="hj-detail__section hj-detail__program" aria-labelledby="hj-program-title">
        <header><span>02</span><h2 id="hj-program-title">PROGRAM</h2></header>
        <div className="hj-detail__programs">{programs.map(({ era, work }) => <article key={era.roman}><p>PROGRAM {era.roman}</p><h3>{era.title}</h3>{era.description && <p className="hj-detail__sequence">{era.description}</p>}<ul>{work.instrumentation?.map((line) => <li key={line}>{line}</li>)}</ul><div className="hj-detail__program-note"><p>{work.composerNote}</p><p>{work.workNote}</p></div></article>)}</div>
      </section>

      <section className="hj-detail__section hj-detail__artists" aria-labelledby="hj-artists-title">
        <header><span>03</span><h2 id="hj-artists-title">ARTISTS</h2></header>
        <div>{performance.simpleCast?.map((artist) => <article key={`${artist.role}-${artist.name}`}><small>{artist.role}</small><strong>{artist.name}</strong></article>)}</div>
      </section>

      <section className="hj-detail__section hj-detail__archive" aria-labelledby="hj-archive-title">
        <header><span>04</span><h2 id="hj-archive-title">ARCHIVE MATERIALS</h2></header>
        <div>{performance.archiveMaterials?.map((material) => <article key={material.label}><h3>{material.label}</h3><p><button type="button" onClick={(event) => archiveViewer.openMaterial(material, event.currentTarget)}>{material.viewLabel}</button>{material.downloadUrl && <a href={assetUrl(material.downloadUrl)} download>{material.downloadLabel}</a>}</p></article>)}</div>
      </section>
      <ArchiveViewer activeMaterial={archiveViewer.activeMaterial} closeMaterial={archiveViewer.closeMaterial} lastTriggerRef={archiveViewer.lastTriggerRef} tone="gold" />
    </article>
  );
}
