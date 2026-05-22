import type { ComboId, SaleStatus, ShippingStatus, UserRole } from "./types";

export type ComboConfig = {
  label: string;
  bottles: string;
  productPrice: number;
  shippingFee: number;
  gift: string | null;
  usageDuration: string;
};

/** Giá sản phẩm + phí ship (nếu có) = tổng thanh toán khi nhận */
export const COMBO_CONFIG: Record<ComboId, ComboConfig> = {
  1: {
    label: "1 hũ",
    bottles: "1 hũ",
    productPrice: 169_000,
    shippingFee: 30_000,
    gift: null,
    usageDuration: "2 tuần",
  },
  2: {
    label: "2 hũ",
    bottles: "2 hũ",
    productPrice: 299_000,
    shippingFee: 0,
    gift: null,
    usageDuration: "1 tháng",
  },
  3: {
    label: "3 hũ + tặng 1 hũ",
    bottles: "4 hũ (mua 3 tặng 1)",
    productPrice: 499_000,
    shippingFee: 0,
    gift: "Tặng thêm 1 hũ",
    usageDuration: "2 tháng",
  },
};

/** Tổng tiền khách trả khi nhận hàng */
export function getComboTotalAmount(combo: ComboId): number {
  const c = COMBO_CONFIG[combo];
  return c.productPrice + c.shippingFee;
}

/** @deprecated dùng getComboTotalAmount — giữ alias cho API */
export const COMBO_PRICES: Record<ComboId, number> = {
  1: getComboTotalAmount(1),
  2: getComboTotalAmount(2),
  3: getComboTotalAmount(3),
};

export const COMBO_LABELS: Record<ComboId, string> = {
  1: COMBO_CONFIG[1].label,
  2: COMBO_CONFIG[2].label,
  3: COMBO_CONFIG[3].label,
};

export function getComboFormLabel(combo: ComboId): string {
  const c = COMBO_CONFIG[combo];
  const total = formatVnd(getComboTotalAmount(combo));
  const ship =
    c.shippingFee > 0
      ? ` (${formatVnd(c.productPrice)} + ship ${formatVnd(c.shippingFee)})`
      : " · Miễn ship";
  const gift = c.gift ? ` · ${c.gift}` : "";
  return `${c.bottles} — ${total}${ship}${gift} · ${c.usageDuration}`;
}

export function getComboPackageNote(combo: ComboId): string {
  const c = COMBO_CONFIG[combo];
  if (combo === 1) {
    return `Tổng ${formatVnd(getComboTotalAmount(1))} · ${c.usageDuration}`;
  }
  if (combo === 2) {
    return `Giao 24–48h · ${c.usageDuration}`;
  }
  return `${c.gift} · ${c.usageDuration}`;
}

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  moi: "Mới",
  da_xac_nhan: "Đã xác nhận",
  chot_don: "Chốt đơn",
  khong_nghe: "Không nghe máy",
  khong_mua: "Không mua",
  huy: "Đã hủy",
};

export const SALE_STATUS_OPTIONS: SaleStatus[] = [
  "moi",
  "da_xac_nhan",
  "chot_don",
  "khong_nghe",
  "khong_mua",
  "huy",
];

export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  cho_giao: "Chờ giao",
  dang_giao: "Đang giao",
  da_giao: "Đã giao",
};

export const SHIPPING_STATUS_OPTIONS: ShippingStatus[] = [
  "cho_giao",
  "dang_giao",
  "da_giao",
];

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export function generateOrderCode(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `TS-${y}${m}${day}-${rand}`;
}

export function canEditCustomer(role: UserRole): boolean {
  return role === "admin" || role === "sale";
}

export function canConfirmOrder(role: UserRole): boolean {
  return role === "admin" || role === "sale";
}

export function canUpdateShipping(role: UserRole): boolean {
  return role === "admin" || role === "shipping";
}

export function canDeleteOrder(role: UserRole): boolean {
  return role === "admin";
}

export function canManageUsers(role: UserRole): boolean {
  return role === "admin";
}

export const PRODUCT_IMAGE =
  "https://statics.pancake.vn/web-media-262/f4/83/cd/50/271b317887e3d8d598b04db4b8437666a0c27782bf3cd01ad6d3014b-w:2048-h:2048-l:5341356-t:image/png.png";
