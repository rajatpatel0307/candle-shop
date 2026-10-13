import { CheckCircle2, CircleAlert } from 'lucide-react';

export function ContactStatus({ success, error }) {
  if (success) {
    return (
      <p className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm font-medium text-green-800">
        <CheckCircle2 className="h-4 w-4" />
        Message sent. Our team will get back to you soon.
      </p>
    );
  }

  if (error) {
    return (
      <p className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm font-medium text-red-800">
        <CircleAlert className="h-4 w-4" />
        {error?.response?.data?.error?.message || 'Could not send message.'}
      </p>
    );
  }

  return null;
}
