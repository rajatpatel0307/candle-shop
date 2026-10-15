export function ShippingAddressSelector({ addresses = [], value, onChange }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="sr-only">Choose a delivery address</legend>
      {addresses.map((address) => (
        <label key={address.AddressId} className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 ${value === address.AddressId ? 'border-[#b56b45] bg-[#faf6ef]' : 'border-stone-200'}`}>
          <input className="mt-1 accent-[#8d5132]" type="radio" name="deliveryAddress" value={address.AddressId} checked={value === address.AddressId} onChange={() => onChange(address.AddressId)} />
          <span className="min-w-0 text-sm leading-6">
            <span className="font-semibold">{address.RecipientName}</span>
            <span className="mx-3 rounded bg-stone-100 px-2 py-1 text-xs text-stone-500">{address.AddressLabel || 'Home'}</span>
            <span className="font-semibold">{address.PhoneNumber}</span>
            <span className="mt-1 block">{[address.AddressLine1, address.AddressLine2, address.Locality, address.City, address.StateOrProvince].filter(Boolean).join(', ')} – <strong>{address.PostalCode}</strong></span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
