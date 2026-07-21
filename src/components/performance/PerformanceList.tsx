import type { Performance } from '../../data/performances';
import { PerformancePreview } from './PerformancePreview';

export function PerformanceList({ performances }: { performances: Performance[] }) {
  return <div className="performance-list">{performances.map((performance) => <PerformancePreview key={performance.id} performance={performance} />)}</div>;
}
