import { HomeHero } from '../components/hero/HomeHero';
import { getFeaturedPerformance } from '../data/performances';

export function HomePage() {
  const featuredPerformance = getFeaturedPerformance();
  return featuredPerformance ? <HomeHero performance={featuredPerformance} /> : null;
}
