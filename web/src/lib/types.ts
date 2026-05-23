export type UserRole = "admin" | "sale" | "shipping";

export type SaleStatus =
  | "moi"
  | "da_xac_nhan"
  | "chot_don"
  | "khong_nghe"
  | "khong_mua"
  | "huy";

export type ShippingStatus = "cho_giao" | "dang_giao" | "da_giao";

export type ComboId = 1 | 2 | 3;

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  address: string;
  combo: ComboId;
  amount: number;
  note: string | null;
  sale_status: SaleStatus;
  shipping_status: ShippingStatus;
  assigned_sale_id: string | null;
  tracking_code: string | null;
  carrier: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderListResult {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderSnapshot {
  id: string;
  label: string;
  order_count: number;
  created_by: string | null;
  created_at: string;
}
