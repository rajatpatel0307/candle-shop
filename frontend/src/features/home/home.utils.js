export function eligibleItems(items = []) {
  return items.filter(Boolean).sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
}

export function heroImage(slide) {
  return slide?.desktopImageUrl || slide?.imageUrl || 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1800&q=80';
}
