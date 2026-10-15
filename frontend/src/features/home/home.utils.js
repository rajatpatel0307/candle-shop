export function eligibleItems(items = []) {
  return items.filter(Boolean).sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
}

export function heroImage(slide) {
  return slide?.desktopImageUrl || slide?.imageUrl || '/images/home/candle-atmosphere.jpg';
}
