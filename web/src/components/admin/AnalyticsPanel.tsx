"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnalyticsSummary, DailyAnalytics } from "@/lib/analytics";
import { defaultAnalyticsRange } from "@/lib/analytics";
import { formatVnd } from "@/lib/orders";

export function AnalyticsPanel() {
  const defaults = defaultAnalyticsRange(30);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [daily, setDaily] = useState<DailyAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ from, to });
    const res = await fetch(`/api/admin/analytics?${params}`);
    const data = await res.json();
    if (res.ok) {
      setDaily(data.daily);
      setSummary(data.summary);
    } else {
      alert(data.error || "Không tải được số liệu");
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const maxOrders = Math.max(1, ...daily.map((d) => d.totalOrders));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-semibold">Số liệu phân tích</h1>
        <p className="text-sm text-[#6f665c] mt-1">
          Theo ngày tạo đơn (giờ Việt Nam). Tỷ lệ chốt = đơn chốt ÷ tổng đơn trong ngày.
        </p>
      </header>

      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <label className="text-sm">
          <span className="block text-xs uppercase text-[#6f665c] mb-1">Từ ngày</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 border border-[#d4c9b8] bg-white"
          />
        </label>
        <label className="text-sm">
          <span className="block text-xs uppercase text-[#6f665c] mb-1">Đến ngày</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 border border-[#d4c9b8] bg-white"
          />
        </label>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 bg-[#4d6358] text-white text-sm font-medium"
        >
          Xem báo cáo
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Tổng đơn" value={String(summary.totalOrders)} />
          <StatCard label="Đơn chốt" value={String(summary.closedOrders)} />
          <StatCard label="Doanh số chốt" value={formatVnd(summary.closedRevenue)} />
          <StatCard label="Tỷ lệ chốt" value={`${summary.closeRate}%`} highlight />
        </div>
      )}

      <div className="bg-white border border-[#e0d6c8] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f6f1e8] text-left text-xs uppercase tracking-wider text-[#6f665c]">
            <tr>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Số đơn</th>
              <th className="px-4 py-3">Đơn chốt</th>
              <th className="px-4 py-3">Doanh số chốt</th>
              <th className="px-4 py-3">Tỷ lệ chốt</th>
              <th className="px-4 py-3 w-32">Biểu đồ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#6f665c]">
                  Đang tải...
                </td>
              </tr>
            ) : daily.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#6f665c]">
                  Không có dữ liệu trong khoảng thời gian này
                </td>
              </tr>
            ) : (
              daily.map((row) => (
                <tr key={row.date} className="border-t border-[#ebe3d4]">
                  <td className="px-4 py-3 font-medium">
                    {formatVnDate(row.date)}
                  </td>
                  <td className="px-4 py-3">{row.totalOrders}</td>
                  <td className="px-4 py-3 text-emerald-800">{row.closedOrders}</td>
                  <td className="px-4 py-3">{formatVnd(row.closedRevenue)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row.closeRate >= 30
                          ? "text-emerald-800 font-medium"
                          : "text-[#6f665c]"
                      }
                    >
                      {row.closeRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-2 bg-[#ebe3d4] rounded overflow-hidden">
                      <div
                        className="h-full bg-[#4d6358] rounded"
                        style={{
                          width: `${(row.totalOrders / maxOrders) * 100}%`,
                        }}
                      />
                    </div>
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

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white border border-[#e0d6c8] p-4">
      <p className="text-xs uppercase tracking-wider text-[#6f665c]">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold font-serif ${
          highlight ? "text-[#4d6358]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatVnDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}
