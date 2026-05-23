"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderSnapshot } from "@/lib/types";

export function BackupPanel() {
  const [snapshots, setSnapshots] = useState<OrderSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [label, setLabel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/backups");
    const data = await res.json();
    if (res.ok) setSnapshots(data.snapshots);
    else alert(data.error || "Không tải được danh sách sao lưu");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createBackup() {
    setCreating(true);
    const res = await fetch("/api/admin/backups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label.trim() || undefined }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setLabel("");
      alert(`Đã sao lưu ${data.snapshot.order_count} đơn hàng.`);
      load();
    } else {
      alert(data.error || "Không tạo được bản sao lưu");
    }
  }

  async function restore(id: string, snapshotLabel: string, count: number) {
    const ok = confirm(
      `Khôi phục ${count} đơn từ bản "${snapshotLabel}"?\n\nĐơn trùng mã (ID) sẽ được ghi đè. Đơn mới hơn bản sao vẫn giữ nguyên nếu không trùng ID.`
    );
    if (!ok) return;

    setRestoringId(id);
    const res = await fetch(`/api/admin/backups/${id}/restore`, { method: "POST" });
    const data = await res.json();
    setRestoringId(null);
    if (res.ok) {
      alert(`Đã khôi phục ${data.restored} đơn.`);
    } else {
      alert(data.error || "Không khôi phục được");
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-semibold">Sao lưu dữ liệu</h1>
        <p className="text-sm text-[#6f665c] mt-1 max-w-xl">
          Tạo bản sao toàn bộ đơn hàng trong database. Dùng khi cần khôi phục sau khi
          xóa nhầm. Chỉ tài khoản quản trị mới thấy mục này.
        </p>
      </header>

      <div className="bg-white border border-[#e0d6c8] p-5 mb-6 max-w-lg">
        <h2 className="font-medium text-sm mb-3">Tạo bản sao lưu mới</h2>
        <label className="block text-sm mb-3">
          <span className="text-xs uppercase text-[#6f665c]">Tên gợi nhớ (tuỳ chọn)</span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="VD: Trước khi dọn đơn tháng 5"
            className="mt-1 w-full border px-3 py-2"
            maxLength={120}
          />
        </label>
        <button
          type="button"
          disabled={creating}
          onClick={createBackup}
          className="px-4 py-2 bg-[#4d6358] text-white text-sm font-medium disabled:opacity-50"
        >
          {creating ? "Đang sao lưu..." : "Sao lưu tất cả đơn hàng"}
        </button>
      </div>

      <div className="bg-white border border-[#e0d6c8] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f6f1e8] text-left text-xs uppercase tracking-wider text-[#6f665c]">
            <tr>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Số đơn</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#6f665c]">
                  Đang tải...
                </td>
              </tr>
            ) : snapshots.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#6f665c]">
                  Chưa có bản sao lưu. Hãy tạo bản đầu tiên.
                </td>
              </tr>
            ) : (
              snapshots.map((s) => (
                <tr key={s.id} className="border-t border-[#ebe3d4]">
                  <td className="px-4 py-3 text-[#6f665c]">
                    {new Date(s.created_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 font-medium">{s.label}</td>
                  <td className="px-4 py-3">{s.order_count}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={restoringId === s.id}
                      onClick={() => restore(s.id, s.label, s.order_count)}
                      className="px-3 py-1.5 border border-[#4d6358] text-[#4d6358] text-xs font-medium hover:bg-[#4d6358] hover:text-white disabled:opacity-50"
                    >
                      {restoringId === s.id ? "Đang khôi phục..." : "Khôi phục"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
