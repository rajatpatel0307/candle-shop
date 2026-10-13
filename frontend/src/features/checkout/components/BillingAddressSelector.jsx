import { selectedAddressLabel } from '../utils/checkoutHelpers.js';

export function BillingAddressSelector({ addresses = [], value, useShipping, onUseShippingChange, onChange }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Billing address</h2>
      <label className="mt-4 flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={useShipping} onChange={(event) => onUseShippingChange(event.target.checked)} />
        Use shipping address as billing address
      </label>
      {!useShipping && (
        <select className="input mt-4" value={value || ''} onChange={(event) => onChange(event.target.value)}>
          <option value="">Select billing address</option>
          {addresses.map((address) => (
            <option key={address.AddressId} value={address.AddressId}>{selectedAddressLabel(address)}</option>
          ))}
        </select>
      )}
    </section>
  );
}
