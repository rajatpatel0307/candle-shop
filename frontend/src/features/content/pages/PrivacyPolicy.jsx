import { LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';

const sections = [
  {
    icon: UserRound,
    title: 'Information we collect',
    text: 'We collect the details needed to manage accounts, orders, delivery, payments, wishlists, reviews, support tickets, and contact requests.',
  },
  {
    icon: ShieldCheck,
    title: 'How we use it',
    text: 'Your information is used to process purchases, send order updates, provide support, improve the storefront, and keep the service secure.',
  },
  {
    icon: LockKeyhole,
    title: 'How we protect it',
    text: 'Access to account and operational data is limited by authentication, role-based permissions, and normal security controls for the application.',
  },
  {
    icon: Mail,
    title: 'Contact choices',
    text: 'You can contact support for help with account details, order history, communication preferences, or privacy-related questions.',
  },
];

export function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-[#8d5132]">Privacy</p>
        <h1 className="mt-3 text-5xl font-semibold text-[#2f2722]">Privacy policy</h1>
        <p className="mt-5 text-lg leading-8 text-stone-700">
          This page summarizes how Candle Studio handles customer and store data across the shopping, checkout, and support experience.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <Icon className="h-6 w-6 text-[#b56b45]" />
              <h2 className="mt-5 text-xl font-semibold">{section.title}</h2>
              <p className="mt-2 leading-7 text-stone-600">{section.text}</p>
            </section>
          );
        })}
      </div>
    </main>
  );
}
