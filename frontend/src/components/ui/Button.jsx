export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`rounded-full bg-candle-espresso px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
