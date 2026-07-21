import { Link, useParams } from 'react-router-dom';
import { performances } from '../data/performances';

export function PerformanceDetailPage() {
  const { id } = useParams();
  const performance = performances.find((item) => item.id === id);
  if (!performance) return <section className="page-shell"><h1>Performance not found</h1><Link className="text-link" to="/performance">Back to performance</Link></section>;

  return <article className="page-shell detail-page"><p className="section-label">HAEGEUM RECITAL 2026</p><h1>{performance.title}</h1><p className="lead">{performance.subtitle}</p><dl className="info-list"><div><dt>Date</dt><dd>{performance.displayDate}</dd></div><div><dt>Venue</dt><dd>{performance.venue}</dd></div></dl><div className="future-sections" aria-label="Future content structure"><span>Introduction</span><span>Artist Note</span><span>Program</span><span>Collaborators</span><span>Leaflet</span></div></article>;
}
