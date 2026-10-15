import { useState } from 'react';

const fields = [
  ['recipientName', 'Full name', 'name'], ['phoneNumber', 'Mobile number', 'tel'],
  ['postalCode', 'PIN code', 'postal-code'], ['city', 'City / district', 'address-level2'],
  ['stateOrProvince', 'State', 'address-level1'], ['locality', 'Locality / landmark (optional)', 'off'],
  ['addressLine1', 'Address (house number, building, street)', 'address-line1'],
  ['addressLine2', 'Additional address details (optional)', 'address-line2'],
];

export function DeliveryAddressForm({ onSave, onCancel, pending, initialValues, showDefaults = false }) {
  const [form, setForm] = useState({ addressLabel: 'Home', countryCode: 'IN', ...initialValues });
  return (
    <form className="rounded-md border border-stone-200 bg-stone-50 p-4 sm:p-5" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
      <h3 className="mb-4 font-semibold">{initialValues ? 'Edit address' : 'Add a delivery address'}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([name, label, autoComplete]) => (
          <label key={name} className={`grid gap-1.5 text-sm ${name.startsWith('addressLine') ? 'sm:col-span-2' : ''}`}>
            {label}
            <input className="input" name={name} autoComplete={autoComplete} value={form[name] || ''}
              onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
              required={!['locality', 'addressLine2'].includes(name)}
              type={name === 'phoneNumber' ? 'tel' : 'text'}
              inputMode={['phoneNumber', 'postalCode'].includes(name) ? 'numeric' : undefined}
              pattern={name === 'phoneNumber' ? '[6-9][0-9]{9}' : name === 'postalCode' ? '[1-9][0-9]{5}' : undefined}
              minLength={name === 'addressLine1' ? 5 : ['recipientName', 'city', 'stateOrProvince'].includes(name) ? 2 : undefined}
              maxLength={name === 'phoneNumber' ? 10 : name === 'postalCode' ? 6 : name.startsWith('addressLine') ? 200 : name === 'locality' ? 120 : ['city', 'stateOrProvince'].includes(name) ? 100 : 150}
              title={name === 'phoneNumber' ? 'Enter a valid 10-digit Indian mobile number' : name === 'postalCode' ? 'Enter a valid 6-digit PIN code' : undefined} />
          </label>
        ))}
      </div>
      <fieldset className="mt-5 flex gap-5 text-sm">
        <legend className="mb-2 font-medium">Address type</legend>
        {['Home', 'Work'].map((label) => <label key={label} className="flex items-center gap-2"><input type="radio" name="addressLabel" checked={form.addressLabel === label} onChange={() => setForm((current) => ({ ...current, addressLabel: label }))} />{label}</label>)}
      </fieldset>
      {showDefaults && <div className="mt-4 grid gap-3 text-sm">{[['isDefaultShipping', 'Default delivery address'], ['isDefaultBilling', 'Default billing address']].map(([name, label]) => <label key={name} className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form[name])} onChange={(event) => setForm({ ...form, [name]: event.target.checked })} />{label}</label>)}</div>}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? 'Saving...' : 'Save address'}</button>
        <button type="button" className="btn-secondary" disabled={pending} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
