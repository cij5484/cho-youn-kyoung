import { Link } from 'react-router-dom';
import { performances } from '../data/performances';
import { Reveal } from '../components/Reveal';
import '../styles/performance.css';

const formatArchiveDate = (displayDate: string) => displayDate.replace(/^\d{4}\.\s*/, '');

export function PerformancePage() {
  const featured = performances.find((performance) => performance.featured) ?? performances[0];
  const archivePerformances = [...performances].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <article className="performance-archive">
      <section className="performance-archive__hero" aria-labelledby="performance-archive-title">
        <div className="performance-archive__copy">
          <p className="performance-archive__eyebrow">ARTIST ARCHIVE</p>
          <h1 id="performance-archive-title">PERFORMANCES</h1>
          <p>{featured?.listDescription ?? '해금 창작곡의 변천을 기록하다'}</p>
        </div>
      </section>

      <Reveal as="section" className="performance-archive__list" aria-label="공연 목록">
        {archivePerformances.map((performance) => (
          <Link className={`performance-archive__row performance-archive__row--${performance.id}${performance.featured ? ' is-featured' : ''}`} to={`/performance/${performance.id}`} key={performance.id}>
            <span className="performance-archive__year">{performance.date.slice(0, 4)}</span>
            <time className="performance-archive__datetime" dateTime={performance.date}>{formatArchiveDate(performance.displayDate)}</time>
            <span className="performance-archive__info">
              <span className="performance-archive__title">{performance.title}</span>
              <small className="performance-archive__subtitle">{performance.subtitle}</small>
            </span>
            <span className="performance-archive__venue">{performance.venue}</span>
            <span className="performance-archive__arrow" aria-hidden="true">VIEW →</span>
          </Link>
        ))}
      </Reveal>
    </article>
  );
}
