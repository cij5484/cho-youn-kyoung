import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="page-shell" aria-labelledby="not-found-title">
      <p>404</p>
      <h1 id="not-found-title">페이지를 찾을 수 없습니다.</h1>
      <p>주소를 다시 확인하거나 아래 링크를 이용해 주세요.</p>
      <p><Link className="text-link" to="/">HOME</Link>{' · '}<Link className="text-link" to="/works">WORKS</Link></p>
    </section>
  );
}
