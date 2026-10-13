export function BannerPreview({ banner }) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-stone-900 text-white shadow-sm">
      <div className="relative min-h-64">
        {banner.desktopImageUrl && <img src={banner.desktopImageUrl} alt={banner.altText || banner.title} className="absolute inset-0 h-full w-full object-cover opacity-60" />}
        <div className="relative p-6">
          <p className="text-sm uppercase">{banner.subtitle}</p>
          <h3 className="mt-2 text-3xl font-semibold">{banner.title || 'Banner title'}</h3>
          <p className="mt-3 max-w-xl text-stone-100">{banner.description}</p>
        </div>
      </div>
    </section>
  );
}
