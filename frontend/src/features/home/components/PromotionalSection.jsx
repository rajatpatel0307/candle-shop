import { Link } from 'react-router-dom';

export function PromotionalSection({ section }) {
  const image = section.imageUrl || section.backgroundImageUrl;
  const imageFirst = section.layoutType !== 'IMAGE_RIGHT';
  const content = (
    <div className="flex flex-col justify-center p-6 md:p-8">
      {section.subtitle && <p className="text-sm font-semibold uppercase text-[#697565]">{section.subtitle}</p>}
      <h2 className="mt-2 text-3xl font-semibold text-stone-900">{section.title}</h2>
      {section.description && <p className="mt-3 leading-7 text-stone-600">{section.description}</p>}
      {section.buttonText && section.buttonUrl && <Link className="btn-primary mt-5 w-fit" to={section.buttonUrl}>{section.buttonText}</Link>}
    </div>
  );
  const media = image ? <img src={image} alt={section.title} className="h-full min-h-72 w-full object-cover" loading="lazy" /> : <div className="min-h-72 bg-stone-100" />;

  if (section.layoutType === 'TEXT_ONLY') return <section className="rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">{content}</section>;
  if (section.layoutType === 'FULL_WIDTH') return <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"><div className="relative">{media}<div className="absolute inset-0 bg-stone-950/40" /><div className="absolute inset-0 flex items-end p-8 text-white"><div><h2 className="text-3xl font-semibold">{section.title}</h2><p className="mt-2 max-w-2xl">{section.description}</p>{section.buttonText && section.buttonUrl && <Link className="btn-primary mt-5" to={section.buttonUrl}>{section.buttonText}</Link>}</div></div></div></section>;
  return <section className="grid overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm md:grid-cols-2">{imageFirst ? <>{media}{content}</> : <>{content}{media}</>}</section>;
}
