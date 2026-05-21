/** URL ảnh CDN Webcake — dùng cho landing */
const CDN =
  "https://statics.pancake.vn/web-media-262/f4/83/cd/50/271b317887e3d8d598b04db4b8437666a0c27782bf3cd01ad6d3014b-w:2048-h:2048-l:5341356-t:image/png.png";

export const LANDING_IMAGES = {
  hero: CDN,
  ritual: CDN,
  product: CDN,
  gallery: [CDN, CDN, CDN] as const,
} as const;
