import { Link } from 'react-router-dom';
import { performances } from '../data/performances';
import '../styles/performance.css';

export function PerformancePage() {
  const featured = performances.find((performance) => performance.featured) ?? performances[0];

  return (
    <article className="performance-archive">
      <section className="performance-archive__hero" aria-labelledby="performance-archive-title">
        <div className="performance-archive__copy">
          <p className="performance-archive__eyebrow">ARTIST ARCHIVE</p>
          <h1 id="performance-archive-title">PERFORMANCES</h1>
          <p>{featured?.listDescription ?? '해금 창작곡의 변천을 기록하다'}</p>
        </div>
        <div className="performance-archive__image" aria-hidden="true">
          {featured?.heroImage && <img src={featured.heroImage} alt="" onError={(event) => event.currentTarget.remove()} />}
        </div>
      </section>

      <section className="performance-archive__list" aria-label="공연 목록">
        {performances.map((performance) => (
          <Link className={`performance-archive__row${performance.featured ? ' is-featured' : ''}`} to={`/performance/${performance.id}`} key={performance.id}>
            <span className="performance-archive__year">{performance.date.slice(0, 4)}</span>
            <span className="performance-archive__date">{performance.displayDate}</span>
            <span className="performance-archive__title">
              {performance.title}
              <small>{performance.subtitle}</small>
            </span>
            <span className="performance-archive__arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </section>
    </article>
  );
}
