import { formatDate } from '../utils/ordersHelpers.js';

export function TrackingTimeline({ events = [] }) {
  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.ShipmentTrackingEventId} className="rounded-md border border-stone-200 bg-white p-3 text-sm shadow-sm">
          <strong>{event.TrackingStatus}</strong>
          <p className="text-stone-600">{event.EventDescription}</p>
          <p className="text-stone-500">{formatDate(event.OccurredAtUtc)} {event.EventLocation}</p>
        </li>
      ))}
    </ol>
  );
}
