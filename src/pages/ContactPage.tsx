import { site } from '../data/site';

export function ContactPage() {
  return <section className="page-shell"><p className="section-label">CONTACT</p><h1>Contact</h1>{site.contactEmail ? <a className="text-link" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> : <p className="muted">공개 이메일은 추후 설정됩니다.</p>}</section>;
}
