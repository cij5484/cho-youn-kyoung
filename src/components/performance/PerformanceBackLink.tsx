import { Link } from 'react-router-dom';

type PerformanceBackLinkProps = {
  className?: string;
  tone?: 'gold' | 'navy';
};

export function PerformanceBackLink({ className = '', tone = 'gold' }: PerformanceBackLinkProps) {
  return (
    <Link className={`performance-back-link performance-back-link--${tone} ${className}`.trim()} to="/performance">
      <span aria-hidden="true">←</span>
      BACK TO PERFORMANCE
    </Link>
  );
}
