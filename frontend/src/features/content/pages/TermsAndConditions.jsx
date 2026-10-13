const sections = [
  {
    title: 'Orders',
    text: 'Orders are accepted after successful checkout and payment confirmation. Product availability, pricing, taxes, and shipping charges are confirmed during checkout.',
  },
  {
    title: 'Shipping',
    text: 'Delivery timelines depend on the selected service, destination, and courier availability. We share tracking details when shipment information is available.',
  },
  {
    title: 'Returns and refunds',
    text: 'Return and refund eligibility depends on product condition, order status, and support review. Damaged or incorrect items should be reported with order details as soon as possible.',
  },
  {
    title: 'Account use',
    text: 'Customers are responsible for keeping account credentials secure. Store administrators may restrict access when suspicious, abusive, or unauthorized activity is detected.',
  },
  {
    title: 'Product information',
    text: 'We aim to keep descriptions, images, fragrance notes, and prices accurate. Minor visual differences may occur because candles and packaging can vary by batch.',
  },
];

export function TermsAndConditions() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-sm font-semibold uppercase text-[#8d5132]">Store policy</p>
      <h1 className="mt-3 text-5xl font-semibold text-[#2f2722]">Terms and conditions</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">
        These terms explain the basic rules for using Candle Studio, placing orders, and contacting support.
      </p>
      <div className="mt-10 grid gap-4">
        {sections.map((section) => (
          <section key={section.title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 leading-7 text-stone-600">{section.text}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
