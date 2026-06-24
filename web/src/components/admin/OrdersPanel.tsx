"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  COMBO_LABELS,
  SALE_STATUS_LABELS,
  SALE_STATUS_OPTIONS,
  SHIPPING_STATUS_LABELS,
  SHIPPING_STATUS_OPTIONS,
  canConfirmOrder,
  canDeleteOrder,
  canEditCustomer,
  canUpdateShipping,
  formatVnd,
} from "@/lib/orders";
import { createClient } from "@/lib/supabase/client";
import type { Order, SaleStatus, ShippingStatus, UserRole } from "@/lib/types";

const POLL_MS = 15_000;

function saleStatusBadge(status: SaleStatus) {
  const colors: Record<SaleStatus, string> = {
    moi: "bg-amber-100 text-amber-900",
    da_xac_nhan: "bg-blue-100 text-blue-900",
    chot_don: "bg-emerald-100 text-emerald-900",
    khong_nghe: "bg-orange-100 text-orange-900",
    khong_mua: "bg-rose-100 text-rose-900",
    huy: "bg-gray-200 text-gray-700",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[status]}`}>
      {SALE_STATUS_LABELS[status]}
    </span>
  );
}

function shippingStatusBadge(status: ShippingStatus) {
  const colors: Record<ShippingStatus, string> = {
    cho_giao: "bg-slate-100 text-slate-800",
    dang_giao: "bg-purple-100 text-purple-900",
    da_giao: "bg-green-100 text-green-900",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[status]}`}>
      {SHIPPING_STATUS_LABELS[status]}
    </span>
  );
}

export function OrdersPanel({ role }: { role: UserRole }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [saleStatus, setSaleStatus] = useState<SaleStatus | "all">("all");
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus | "all">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const selectedIdRef = useRef<string | null>(null);
  const pageSize = 20;

  useEffect(() => {
    selectedIdRef.current = selected?.id ?? null;
  }, [selected?.id]);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      if (silent) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (q) params.set("q", q);
      if (saleStatus !== "all") params.set("sale_status", saleStatus);
      if (shippingStatus !== "all") params.set("shipping_status", shippingStatus);

      try {
        const res = await fetch(`/api/admin/orders?${params}`, { cache: "no-store" });
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders);
          setTotal(data.total);
          setLastSync(new Date());
          const sid = selectedIdRef.current;
          if (sid) {
            const fresh = (data.orders as Order[]).find((o) => o.id === sid);
            if (fresh) setSelected(fresh);
          }
        }
      } finally {
        if (silent) setRefreshing(false);
        else setLoading(false);
      }
    },
    [page, q, saleStatus, shippingStatus]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") load({ silent: true });
    };
    const id = window.setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") load({ silent: true });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => load({ silent: true })
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  async function saveOrder(patch: Partial<Order>) {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setSelected(data.order);
      load();
    } else {
      alert(data.error || "Lỗi lưu");
    }
  }

  async function deleteOrder() {
    if (!selected || !confirm("Xóa đơn này?")) return;
    const res = await fetch(`/api/admin/orders/${selected.id}`, { method: "DELETE" });
    if (res.ok) {
      setSelected(null);
      load();
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Đơn hàng</h1>
          <p className="text-sm text-[#6f665c] mt-1">{total} đơn trong hệ thống</p>
        </div>
        <p className="text-xs text-[#6f665c]">
          {refreshing ? (
            <span className="text-[#4d6358]">Đang cập nhật…</span>
          ) : lastSync ? (
            <>Tự động cập nhật · {lastSync.toLocaleTimeString("vi-VN")}</>
          ) : (
            "Tự động cập nhật"
          )}
        </p>
      </header>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="search"
          placeholder="Tìm tên, SĐT, mã đơn..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="flex-1 min-w-[200px] px-3 py-2 border border-[#d4c9b8] bg-white text-sm"
        />
        <select
          value={saleStatus}
          onChange={(e) => {
            setSaleStatus(e.target.value as SaleStatus | "all");
            setPage(1);
          }}
          className="px-3 py-2 border border-[#d4c9b8] bg-white text-sm"
        >
          <option value="all">Tất cả — Sale</option>
          {SALE_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SALE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={shippingStatus}
          onChange={(e) => {
            setShippingStatus(e.target.value as ShippingStatus | "all");
            setPage(1);
          }}
          className="px-3 py-2 border border-[#d4c9b8] bg-white text-sm"
        >
          <option value="all">Tất cả — Vận chuyển</option>
          {SHIPPING_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SHIPPING_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => load()}
          className="px-4 py-2 bg-[#4d6358] text-white text-sm font-medium"
        >
          Tìm kiếm
        </button>
      </div>

      <div className="bg-white border border-[#e0d6c8] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f6f1e8] text-left text-xs uppercase tracking-wider text-[#6f665c]">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Khách</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Gói</th>
              <th className="px-4 py-3">Tiền</th>
              <th className="px-4 py-3">Sale</th>
              <th className="px-4 py-3">Vận chuyển</th>
              <th className="px-4 py-3">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#6f665c]">
                  Đang tải...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#6f665c]">
                  Không có đơn
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="border-t border-[#ebe3d4] cursor-pointer hover:bg-[#faf6ef]"
                >
                  <td className="px-4 py-3 font-mono text-xs">{o.order_code}</td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="px-4 py-3">{o.phone}</td>
                  <td className="px-4 py-3">{COMBO_LABELS[o.combo]}</td>
                  <td className="px-4 py-3">{formatVnd(o.amount)}</td>
                  <td className="px-4 py-3">{saleStatusBadge(o.sale_status)}</td>
                  <td className="px-4 py-3">
                    {shippingStatusBadge(o.shipping_status)}
                  </td>
                  <td className="px-4 py-3 text-[#6f665c]">
                    {new Date(o.created_at).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border disabled:opacity-40"
        >
          Trước
        </button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border disabled:opacity-40"
        >
          Sau
        </button>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md h-full bg-[#f6f1e8] overflow-y-auto p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl font-semibold">{selected.order_code}</h2>
            <p className="text-sm text-[#6f665c] mt-1 mb-4">
              {new Date(selected.created_at).toLocaleString("vi-VN")}
            </p>

            <OrderDetailForm
              order={selected}
              role={role}
              saving={saving}
              onSave={saveOrder}
              onDelete={canDeleteOrder(role) ? deleteOrder : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function OrderDetailForm({
  order,
  role,
  saving,
  onSave,
  onDelete,
}: {
  order: Order;
  role: UserRole;
  saving: boolean;
  onSave: (p: Partial<Order>) => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState(order);
  const isAdmin = role === "admin";
  const canEditSale = isAdmin || canConfirmOrder(role);
  const canEditShip = isAdmin || canUpdateShipping(role);

  useEffect(() => setForm(order), [order]);

  const field = (label: string, children: React.ReactNode) => (
    <label className="block mb-3 text-sm">
      <span className="text-xs uppercase tracking-wider text-[#6f665c]">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const patch: Partial<Order> = {};
        if (canEditCustomer(role) || isAdmin) {
          patch.customer_name = form.customer_name;
          patch.phone = form.phone;
          patch.address = form.address;
          patch.combo = form.combo;
          patch.note = form.note;
        }
        if (canEditSale) patch.sale_status = form.sale_status;
        if (canEditShip) {
          patch.shipping_status = form.shipping_status;
          patch.tracking_code = form.tracking_code;
          patch.carrier = form.carrier;
        }
        onSave(patch);
      }}
    >
      {field(
        "Khách hàng",
        <input
          className="w-full border px-2 py-1.5 bg-white"
          value={form.customer_name}
          disabled={!canEditCustomer(role)}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
        />
      )}
      {field(
        "SĐT",
        <input
          className="w-full border px-2 py-1.5 bg-white"
          value={form.phone}
          disabled={!canEditCustomer(role)}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      )}
      {field(
        "Địa chỉ",
        <textarea
          className="w-full border px-2 py-1.5 bg-white"
          rows={2}
          value={form.address}
          disabled={!canEditCustomer(role)}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      )}
      {field(
        "Gói",
        <select
          className="w-full border px-2 py-1.5 bg-white"
          value={form.combo}
          disabled={!canEditCustomer(role)}
          onChange={(e) =>
            setForm({ ...form, combo: parseInt(e.target.value, 10) as Order["combo"] })
          }
        >
          <option value={1}>{COMBO_LABELS[1]}</option>
          <option value={2}>{COMBO_LABELS[2]}</option>
          <option value={3}>{COMBO_LABELS[3]}</option>
        </select>
      )}
      {field(
        "Ghi chú",
        <input
          className="w-full border px-2 py-1.5 bg-white"
          value={form.note ?? ""}
          disabled={!canEditCustomer(role)}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
      )}
      {field(
        "Trạng thái Sale",
        <select
          className="w-full border px-2 py-1.5 bg-white disabled:bg-[#f0ebe3]"
          value={form.sale_status}
          disabled={!canEditSale}
          onChange={(e) =>
            setForm({ ...form, sale_status: e.target.value as SaleStatus })
          }
        >
          {SALE_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SALE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      )}
      {field(
        "Trạng thái vận chuyển",
        <select
          className="w-full border px-2 py-1.5 bg-white disabled:bg-[#f0ebe3]"
          value={form.shipping_status}
          disabled={!canEditShip}
          onChange={(e) =>
            setForm({
              ...form,
              shipping_status: e.target.value as ShippingStatus,
            })
          }
        >
          {SHIPPING_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SHIPPING_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      )}
      {canEditShip &&
        field(
          "Mã vận đơn",
          <input
            className="w-full border px-2 py-1.5 bg-white"
            value={form.tracking_code ?? ""}
            onChange={(e) => setForm({ ...form, tracking_code: e.target.value })}
          />
        )}
      {canEditShip &&
        field(
          "Đơn vị VC",
          <input
            className="w-full border px-2 py-1.5 bg-white"
            value={form.carrier ?? ""}
            onChange={(e) => setForm({ ...form, carrier: e.target.value })}
          />
        )}

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-[#4d6358] text-white text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        {canEditSale && form.sale_status === "moi" && (
          <button
            type="button"
            className="px-4 py-2 bg-[#b8956a] text-[#141210] text-sm"
            onClick={() => onSave({ sale_status: "da_xac_nhan" })}
          >
            Xác nhận đơn
          </button>
        )}
        {canEditSale &&
          (form.sale_status === "moi" || form.sale_status === "da_xac_nhan") && (
            <>
              <button
                type="button"
                className="px-4 py-2 bg-emerald-700 text-white text-sm"
                onClick={() => onSave({ sale_status: "chot_don" })}
              >
                Chốt đơn
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-orange-300 text-orange-900 text-sm"
                onClick={() => onSave({ sale_status: "khong_nghe" })}
              >
                Không nghe máy
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-rose-300 text-rose-900 text-sm"
                onClick={() => onSave({ sale_status: "khong_mua" })}
              >
                Không mua
              </button>
            </>
          )}
        {canEditShip && form.shipping_status !== "dang_giao" && (
          <button
            type="button"
            className="px-4 py-2 border text-sm"
            onClick={() => onSave({ shipping_status: "dang_giao" })}
          >
            Đang giao
          </button>
        )}
        {canEditShip && form.shipping_status === "dang_giao" && (
          <button
            type="button"
            className="px-4 py-2 border text-sm"
            onClick={() => onSave({ shipping_status: "da_giao" })}
          >
            Đã giao
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 text-red-700 text-sm ml-auto"
          >
            Xóa đơn
          </button>
        )}
      </div>
    </form>
  );
}
