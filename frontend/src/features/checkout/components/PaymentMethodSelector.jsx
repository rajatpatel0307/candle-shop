import { CreditCard } from 'lucide-react';

export function PaymentMethodSelector({ value = 'COD', onChange, onlineAvailable = false }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Payment</h2>
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md border border-stone-200 p-4">
        <input type="radio" name="paymentMethod" checked={value === 'COD'} onChange={() => onChange?.('COD')} className="mt-1 accent-[#8d5132]" />
        <span><span className="block font-semibold">Cash on delivery</span><span className="text-sm text-stone-600">Pay when your order arrives.</span></span>
      </label>
      <label className={`mt-3 flex items-start gap-3 rounded-md border border-stone-200 p-4 ${onlineAvailable ? 'cursor-pointer' : 'opacity-60'}`}>
        <input type="radio" name="paymentMethod" checked={value === 'ONLINE'} onChange={() => onChange?.('ONLINE')} disabled={!onlineAvailable} className="mt-1 accent-[#8d5132]" />
        <CreditCard className="h-5 w-5 text-[#b56b45]" />
        <div>
          <p className="font-semibold">Razorpay checkout</p>
          <p className="text-sm text-stone-600">{onlineAvailable ? 'Pay by card, UPI, wallet, or netbanking in the secure payment window.' : 'Online payment is currently unavailable. Please choose cash on delivery.'}</p>
        </div>
      </label>
    </section>
  );
}
