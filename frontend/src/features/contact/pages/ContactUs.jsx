import { useMutation } from '@tanstack/react-query';
import { Clock3, Headphones, Mail, MapPin } from 'lucide-react';
import { contactApi } from '../contact.api.js';
import { ContactForm } from '../components/ContactForm.jsx';
import { ContactStatus } from '../components/ContactStatus.jsx';

const contactCards = [
  { icon: Mail, title: 'Email support', text: 'support@candlestudio.local' },
  { icon: Clock3, title: 'Response time', text: 'Usually within 1 business day' },
  { icon: MapPin, title: 'Service area', text: 'Orders and support across India' },
];

export function ContactUs() {
  const mutation = useMutation({ mutationFn: contactApi.submit });

  return (
    <main>
      <section className="bg-[#efe6d8] px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase text-[#8d5132]">Contact</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-tight text-[#2f2722]">We are here to help with orders, gifting, and candle care.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
            Send a message with your question or order details. The support team can help with product choices, delivery, returns, and account questions.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <Headphones className="h-7 w-7 text-[#b56b45]" />
            <h2 className="mt-4 text-2xl font-semibold">Support details</h2>
            <p className="mt-2 leading-7 text-stone-600">
              Include your order number when available so we can find the right record faster.
            </p>
          </div>
          <div className="grid gap-4">
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="flex gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                  <Icon className="mt-1 h-5 w-5 text-[#b56b45]" />
                  <div>
                    <h3 className="font-semibold">{card.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-stone-600">{card.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Send us a message</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">All fields are required.</p>
          </div>
          <ContactForm pending={mutation.isPending} success={mutation.isSuccess} onSubmit={(payload) => mutation.mutate(payload)} />
          <div className="mt-4">
            <ContactStatus success={mutation.isSuccess} error={mutation.error} />
          </div>
        </section>
      </section>
    </main>
  );
}
