import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-[#f7f2ea] text-[#2f2722]">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-stone-900 lg:block">
          <img src="https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1200&q=80" alt="Candle glow" className="h-full w-full object-cover opacity-70" />
        </section>
        <section className="flex items-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-10 flex items-center gap-2 text-lg font-semibold">
              <Flame className="h-5 w-5 text-[#b56b45]" /> Candle Commerce
            </Link>
            <h1 className="text-4xl font-semibold">{title}</h1>
            <p className="mt-3 text-stone-600">{subtitle}</p>
            <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
