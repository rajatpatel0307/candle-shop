import { Truck, MapPin } from 'lucide-react';

export function CartPriceBreakdown() {
  return <section className="grid gap-5 rounded-2xl border border-[#e8ddcf] bg-[#f0e7d9] p-5 sm:grid-cols-2 sm:p-6" aria-label="Delivery information">
    <div className="flex items-start gap-3"><Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#a27d58]" strokeWidth={1.5} /><div><h2 className="text-xs font-semibold text-[#72583f]">Delivery, made simple</h2><p className="mt-1.5 text-xs leading-5 text-[#9a846e]">Delivery charges are calculated using your address at checkout.</p></div></div>
    <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#a27d58]" strokeWidth={1.5} /><div><h2 className="text-xs font-semibold text-[#72583f]">Choose where it goes</h2><p className="mt-1.5 text-xs leading-5 text-[#9a846e]">Select a saved address or add a new delivery address in the next step.</p></div></div>
  </section>;
}
