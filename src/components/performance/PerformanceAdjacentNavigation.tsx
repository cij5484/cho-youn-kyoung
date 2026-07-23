import { Link } from 'react-router-dom';
import { performances } from '../../data/performances';
import { PerformanceBackLink } from './PerformanceBackLink';

export function PerformanceAdjacentNavigation({ currentId, tone }: { currentId: string; tone: 'gold' | 'navy' }) {
  const sorted = [...performances].sort((a, b) => a.date.localeCompare(b.date));
  const index = sorted.findIndex((performance) => performance.id === currentId);
  const previous = index > 0 ? sorted[index - 1] : undefined;
  const next = index >= 0 ? sorted[index + 1] : undefined;
  return <nav className={`performance-adjacent performance-adjacent--${tone}`} aria-label="공연 상세 내비게이션">
    <PerformanceBackLink tone={tone} />
    <div className="performance-adjacent__links">
      {previous && <Link to={`/performance/${previous.id}`}><span>PREVIOUS PERFORMANCE</span><strong>{previous.title} →</strong></Link>}
      {next && <Link to={`/performance/${next.id}`}><span>NEXT PERFORMANCE</span><strong>{next.title} →</strong></Link>}
    </div>
  </nav>;
}
