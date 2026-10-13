import { Link } from 'react-router-dom';

export function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link className="hover:text-[#8d5132]" to="/">Home</Link></li>
        {items.map((item) => <li key={item.label} className="flex items-center gap-2"><span>/</span>{item.to ? <Link className="hover:text-[#8d5132]" to={item.to}>{item.label}</Link> : <span>{item.label}</span>}</li>)}
      </ol>
    </nav>
  );
}
