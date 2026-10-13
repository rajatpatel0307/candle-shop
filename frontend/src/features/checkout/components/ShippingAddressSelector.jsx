import { selectedAddressLabel } from '../utils/checkoutHelpers.js';

export function ShippingAddressSelector({ addresses = [], value, onChange }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Shipping address</h2>
      <select className="input mt-4" value={value || ''} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select shipping address</option>
        {addresses.map((address) => (
          <option key={address.AddressId} value={address.AddressId}>{selectedAddressLabel(address)}</option>
        ))}
      </select>
    </section>
  );
}
