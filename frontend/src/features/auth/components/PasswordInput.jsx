import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';

export const PasswordInput = forwardRef(function PasswordInput({ label, error, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="grid gap-1 text-sm font-medium text-stone-700">
      {label}
      <span className="flex items-center rounded-md border border-stone-300 bg-white focus-within:border-[#b56b45] focus-within:ring-2 focus-within:ring-[#b56b45]/20">
        <input ref={ref} {...props} type={visible ? 'text' : 'password'} className="w-full rounded-md bg-transparent px-3 py-2 outline-none" />
        <button type="button" className="px-3 text-stone-500" onClick={() => setVisible((value) => !value)} aria-label={visible ? 'Hide password' : 'Show password'}>
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </label>
  );
});
