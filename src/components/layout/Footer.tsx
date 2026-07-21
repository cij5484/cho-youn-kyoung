import { site } from '../../data/site';

export function Footer() {
  return <footer className="site-footer"><span>{site.artistName}</span><span>Official Website</span></footer>;
}
