import { Link } from '@tanstack/react-router';

export function SiteTitle() {
  return (
    <Link
      to="/"
      className="inline-block px-1 -mx-1 leading-none hover:bg-[var(--accent)] hover:text-white"
    >
      <h1>LEONARDO_PETRUCCI</h1>
    </Link>
  );
}
