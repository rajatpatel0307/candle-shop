import { Link } from 'react-router-dom';
import { currency } from '../utils/cartHelpers.js';

export function CartSummary({ summary, validation, onValidate, onClear }) {
  const blocked = summary?.isValid === false || validation?.isValid === false;
  return (
    <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Summary</h2>
      <div className="mt-4 grid gap-3 text-sm">
        <Row label="Items" value={summary?.totalQuantity || 0} />
        <Row label="Subtotal" value={currency(summary?.subtotal || 0)} />
      </div>
      {blocked && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">Resolve cart validation messages before checkout.</p>}
      <div className="mt-5 grid gap-3">
        <button className="btn-secondary" onClick={onValidate}>Validate cart</button>
        <Link className={`btn-primary ${blocked ? 'pointer-events-none opacity-60' : ''}`} to="/checkout">Proceed to checkout</Link>
        <button className="text-sm font-semibold text-red-700" onClick={onClear}>Clear cart</button>
      </div>
    </aside>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between gap-4"><span className="text-stone-500">{label}</span><strong>{value}</strong></div>;
}
