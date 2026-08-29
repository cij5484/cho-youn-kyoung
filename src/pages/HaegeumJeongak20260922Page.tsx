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
          <p className="hj-detail__subtitle"><span>조윤경의 해금정악</span><span>해금상령산풀이 · 관악영산회상</span></p>
          <div className="hj-detail__event">
            <time className="hj-detail__date" dateTime={performance.date}><strong>22</strong><span>SEP</span><span>2026</span></time>
            <div className="hj-detail__venue"><strong>19:30</strong><p>{performance.venue}</p><small>{performance.venueAddress}</small></div>
          </div>
          <div className="hj-detail__attendance"><strong>{performance.performer}</strong><p>{performance.ticketPrice} · {performance.seating}</p><small>{performance.ageRestriction}</small></div>
          <div className="hj-detail__actions">{openButton('POSTER')}{openButton('LEAFLET')}</div>
        </div>
      </section>

      <section className="hj-detail__section hj-detail__note" aria-labelledby="hj-note-title">
        <header><span>01</span><h2 id="hj-note-title">ARTIST’S NOTE</h2></header>
        <blockquote>{performance.artistNote.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<cite>{performance.artistSignature}</cite></blockquote>
      </section>

      <section className="hj-detail__section hj-detail__program" aria-labelledby="hj-program-title">
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

      <section className="hj-detail__section hj-detail__artists" aria-labelledby="hj-artists-title">
        <header><span>03</span><h2 id="hj-artists-title">ARTISTS</h2></header>
        <div>{performance.simpleCast?.map((artist) => <article key={`${artist.role}-${artist.name}`}><small>{artist.role}</small><strong>{artist.name}</strong></article>)}</div>
      </section>

      <section className="hj-detail__section hj-detail__archive" aria-labelledby="hj-archive-title">
        <header><span>04</span><h2 id="hj-archive-title">ARCHIVE MATERIALS</h2></header>
        <div className="hj-detail__gallery">{performance.archiveMaterials?.flatMap((material) => material.previewImages.map((image) => <figure key={image.src}>
          <button className="hj-detail__archive-image" type="button" aria-label={`${image.alt} 보기`} onClick={(event) => archiveViewer.openMaterial(material, event.currentTarget)}><SafeImage src={assetUrl(image.src)} alt={image.alt} fallbackClassName="safe-image-fallback" fallbackLabel={image.label ?? material.label} /></button>
          <figcaption><span>{material.label}{image.label && ` / ${image.label}`}</span><button type="button" onClick={(event) => archiveViewer.openMaterial(material, event.currentTarget)}>VIEW</button>{material.downloadUrl && <a href={assetUrl(material.downloadUrl)} download>PDF</a>}</figcaption>
        </figure>))}</div>
      </section>
      <ArchiveViewer activeMaterial={archiveViewer.activeMaterial} closeMaterial={archiveViewer.closeMaterial} lastTriggerRef={archiveViewer.lastTriggerRef} tone="violet" />
    </article>
  );
}
