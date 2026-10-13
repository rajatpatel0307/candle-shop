import { Link } from 'react-router-dom';
import { Flame, Gift, Leaf, ShieldCheck } from 'lucide-react';

const values = [
  { icon: Flame, title: 'Small-batch craft', text: 'Each collection is planned around balanced fragrance, clean burn quality, and thoughtful presentation.' },
  { icon: Leaf, title: 'Considered materials', text: 'We favor dependable wax blends, reusable vessels, and packaging choices that feel gift-ready without excess.' },
  { icon: Gift, title: 'Made for gifting', text: 'From calm daily rituals to festive bundles, the catalog is shaped for personal moments and memorable presents.' },
  { icon: ShieldCheck, title: 'Reliable service', text: 'Orders, support, and store operations are backed by a full commerce dashboard for smoother handling.' },
];

export function AboutUs() {
  return (
    <main>
      <section className="bg-[#efe6d8] px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-[#8d5132]">Our story</p>
            <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-tight text-[#2f2722]">Candles for quiet rooms, warm tables, and thoughtful gifts.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
              Candle Studio brings together warm fragrance profiles, polished presentation, and a practical storefront experience for people who want beautiful candles without fuss.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">Shop candles</Link>
              <Link to="/contact" className="btn-secondary">Contact us</Link>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1100&q=80"
            alt="Lit candles arranged on a table"
            className="aspect-[4/3] w-full rounded-lg object-cover shadow-sm"
          />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <Icon className="h-6 w-6 text-[#b56b45]" />
                <h2 className="mt-5 text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
