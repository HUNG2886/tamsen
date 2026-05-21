"use client";

import { LANDING_IMAGES } from "@/lib/images";

const FALLBACK = "/images/product.png";

type Props = React.ImgHTMLAttributes<HTMLImageElement>;

/** Ảnh landing: CDN + fallback local, tránh lỗi hotlink / referrer */
export function LandingImage({ src, onError, alt = "", ...rest }: Props) {
  const primary = src || LANDING_IMAGES.hero;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      alt={alt}
      src={primary}
      referrerPolicy="no-referrer"
      decoding="async"
      onError={(e) => {
        const el = e.currentTarget;
        if (el.src !== FALLBACK && !el.dataset.fallback) {
          el.dataset.fallback = "1";
          el.src = FALLBACK;
        }
        onError?.(e);
      }}
    />
  );
}
