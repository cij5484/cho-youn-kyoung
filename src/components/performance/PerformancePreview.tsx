import { Link } from 'react-router-dom';
import type { Performance } from '../../data/performances';

export function PerformancePreview({ performance }: { performance: Performance }) {
  return <Link className="performance-preview" to={`/performance/${performance.id}`}><time dateTime={performance.date}>{performance.displayDate}</time><div><h2>{performance.title}</h2><p>{performance.subtitle}</p><span>{performance.venue}</span></div></Link>;
}
