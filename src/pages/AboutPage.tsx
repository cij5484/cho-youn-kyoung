import { profile } from '../data/profile';

export function AboutPage() {
  return <section className="page-shell"><p className="section-label">ABOUT</p><h1>{profile.name}</h1><p className="lead">{profile.role}</p><p>{profile.affiliation}</p></section>;
}
