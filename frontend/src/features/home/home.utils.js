export function eligibleItems(items = []) {
  return items.filter(Boolean).sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
}

export function heroImage(slide) {
  return slide?.desktopImageUrl || slide?.imageUrl || 'https://res.cloudinary.com/de1smdldp/image/upload/v1792133757/candle-studio/uploads/zysikdkdrcozt9v9ey2b.jpg';
}
