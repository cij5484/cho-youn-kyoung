import { performances } from '../data/performances';

export function getAdjacentPerformances(currentId: string) {
  const sorted = [...performances].sort((a, b) => a.date.localeCompare(b.date));
  const index = sorted.findIndex((performance) => performance.id === currentId);

  return {
    previous: index > 0 ? sorted[index - 1] : undefined,
    next: index >= 0 ? sorted[index + 1] : undefined,
  };
}
