import { CreditCard } from 'lucide-react';

export function PaymentMethodSelector() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Payment</h2>
      <div className="mt-4 flex items-center gap-3 rounded-md border border-[#b56b45] p-3">
        <CreditCard className="h-5 w-5 text-[#b56b45]" />
        <div>
          <p className="font-semibold">Razorpay checkout</p>
          <p className="text-sm text-stone-600">Card, UPI, wallet, and netbanking options appear in the secure payment window.</p>
        </div>
      </div>
    </section>
  );
}
