import { PerformanceList } from '../components/performance/PerformanceList';
import { performances } from '../data/performances';

export function PerformancePage() {
  return <section className="page-shell"><p className="section-label">PERFORMANCE</p><h1>Performance Archive</h1><PerformanceList performances={performances} /></section>;
}
