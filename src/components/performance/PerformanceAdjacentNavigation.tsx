import { Link } from 'react-router-dom';
import { getAdjacentPerformances } from '../../utils/performanceNavigation';
import { PerformanceBackLink } from './PerformanceBackLink';

export function PerformanceAdjacentNavigation({ currentId, tone }: { currentId: string; tone: 'gold' | 'navy' }) {
  const { previous, next } = getAdjacentPerformances(currentId);
  return <nav className={`performance-adjacent performance-adjacent--${tone}`} aria-label="공연 상세 내비게이션">
    <PerformanceBackLink tone={tone} />
    <div className="performance-adjacent__links">
      {previous && <Link className="performance-adjacent__performance-link" to={`/performance/${previous.id}`}><span>PREVIOUS PERFORMANCE</span><strong>{previous.title} →</strong></Link>}
      {next && <Link className="performance-adjacent__performance-link" to={`/performance/${next.id}`}><span>NEXT PERFORMANCE</span><strong>{next.title} →</strong></Link>}
    </div>
  </nav>;
}
