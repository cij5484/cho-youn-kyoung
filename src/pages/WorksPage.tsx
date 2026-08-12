import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { albums } from '../data/albums';
import { performances } from '../data/performances';
import '../styles/works.css';

const formatArchiveDate = (displayDate: string) => displayDate.replace(/^\d{4}\.\s*/, '');
const sections = [
  { id: 'performances', number: '01', title: 'PERFORMANCES' },
  { id: 'albums', number: '02', title: 'ALBUMS' },
] as const;

export function WorksPage() {
  const archivePerformances = [...performances].sort((a, b) => b.date.localeCompare(a.date));
  const archiveAlbums = [...albums].sort((a, b) => b.year.localeCompare(a.year));
  const scrollToSection = (id: (typeof sections)[number]['id']) => {
    document.getElementById(`works-${id}`)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <article className="works-archive">
      <section className="works-archive__hero" aria-labelledby="works-archive-title">
        <div className="works-archive__hero-inner">
          <div className="works-archive__copy">
            <p className="works-archive__eyebrow">ARTIST ARCHIVE</p>
            <h1 id="works-archive-title">WORKS</h1>
            <p className="works-archive__intro">조윤경의 공연과 음반 기록을 모아 소개합니다.</p>
            <span className="works-archive__rule" aria-hidden="true" />
          </div>
          <nav className="works-archive__index" aria-label="WORKS 섹션 바로가기">
            {sections.map((section) => (
              <button type="button" key={section.id} onClick={() => scrollToSection(section.id)}>
                <span>{section.number}</span><strong>{section.title}</strong><i aria-hidden="true">→</i>
              </button>
            ))}
          </nav>
        </div>
      </section>

      <div className="works-archive__body">
        <Reveal as="section" id="works-performances" className="works-section" aria-labelledby="works-performances-title">
          <header className="works-section__heading reveal__heading"><span>01</span><h2 id="works-performances-title">PERFORMANCES</h2></header>
          <div className="works-section__content reveal__content">
            {archivePerformances.map((performance) => (
              <Link className={`works-archive__row works-archive__row--${performance.id}${performance.featured ? ' is-featured' : ''}`} to={`/performance/${performance.id}`} key={performance.id}>
                <span className="works-archive__year">{performance.date.slice(0, 4)}</span>
                <time className="works-archive__datetime" dateTime={performance.date}>{formatArchiveDate(performance.displayDate)}</time>
                <span className="works-archive__info"><span className="works-archive__title">{performance.title}</span><small className="works-archive__subtitle">{performance.subtitle}</small></span>
                <span className="works-archive__venue">{performance.venue}</span>
                <span className="works-archive__arrow" aria-hidden="true">VIEW →</span>
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" id="works-albums" className="works-section works-section--albums" aria-labelledby="works-albums-title">
          <header className="works-section__heading reveal__heading"><span>02</span><h2 id="works-albums-title">ALBUMS</h2></header>
          <div className="works-section__content reveal__content">
            {archiveAlbums.map((album) => {
              const streamingLink = album.streamingLinks?.find((link) => Boolean(link.url));
              const content = <><span className="works-archive__year">{album.year}</span><span className="works-archive__info"><span className="works-archive__title">{album.title}</span><small className="works-archive__subtitle">{album.description}</small></span><span className="works-archive__album-status">{streamingLink?.platform ?? ''}</span>{(album.detailsPath || streamingLink) && <span className="works-archive__arrow" aria-hidden="true">{album.detailsPath ? 'VIEW →' : 'LISTEN ↗'}</span>}</>;
              if (album.detailsPath) return <Link className="works-archive__row works-archive__row--album" to={album.detailsPath} key={album.id}>{content}</Link>;
              if (streamingLink) return <a className="works-archive__row works-archive__row--album" href={streamingLink.url} target="_blank" rel="noopener noreferrer" key={album.id}>{content}</a>;
              return <div className="works-archive__row works-archive__row--album works-archive__row--static" key={album.id}>{content}</div>;
            })}
          </div>
        </Reveal>
      </div>
    </article>
  );
}
