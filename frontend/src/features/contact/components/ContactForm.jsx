import { useState } from 'react';
import { Send } from 'lucide-react';

const initialForm = { name: '', email: '', subject: '', message: '' };

export function ContactForm({ onSubmit, pending, success }) {
  const [form, setForm] = useState(initialForm);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Name
          <input className="input" value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="Your name" required />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Email
          <input className="input" type="email" value={form.email} onChange={(event) => set('email', event.target.value)} placeholder="you@example.com" required />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium text-stone-700">
        Subject
        <input className="input" value={form.subject} onChange={(event) => set('subject', event.target.value)} placeholder="How can we help?" required />
      </label>
      <label className="grid gap-1 text-sm font-medium text-stone-700">
        Message
        <textarea className="input min-h-36 resize-y" value={form.message} onChange={(event) => set('message', event.target.value)} placeholder="Share order details, product questions, or anything else we should know." required />
      </label>
      <button className="btn-primary w-fit" disabled={pending || success}>
        <Send className="h-4 w-4" />
        {pending ? 'Sending...' : success ? 'Sent' : 'Send message'}
      </button>
    </form>
  );
}
