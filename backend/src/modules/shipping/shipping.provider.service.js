export function buildTrackingUrl({ carrierName, trackingNumber, trackingUrl }) {
  if (trackingUrl) return trackingUrl;
  if (!trackingNumber) return null;
  return `https://www.google.com/search?q=${encodeURIComponent(`${carrierName} ${trackingNumber}`)}`;
}
