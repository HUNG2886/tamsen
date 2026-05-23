import type { SaleStatus } from "./types";

const VN_TZ = "Asia/Ho_Chi_Minh";

export type OrderAnalyticsRow = {
  created_at: string;
  amount: number;
  sale_status: SaleStatus;
};

export type DailyAnalytics = {
  date: string;
  totalOrders: number;
  closedOrders: number;
  closedRevenue: number;
  closeRate: number;
};

export type AnalyticsSummary = {
  totalOrders: number;
  closedOrders: number;
  closedRevenue: number;
  closeRate: number;
};

export function toVnDateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: VN_TZ }).format(new Date(iso));
}

export function aggregateDailyAnalytics(
  orders: OrderAnalyticsRow[]
): DailyAnalytics[] {
  const byDay = new Map<
    string,
    { total: number; closed: number; revenue: number }
  >();

  for (const o of orders) {
    const day = toVnDateKey(o.created_at);
    const row = byDay.get(day) ?? { total: 0, closed: 0, revenue: 0 };
    row.total += 1;
    if (o.sale_status === "chot_don") {
      row.closed += 1;
      row.revenue += o.amount;
    }
    byDay.set(day, row);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, row]) => ({
      date,
      totalOrders: row.total,
      closedOrders: row.closed,
      closedRevenue: row.revenue,
      closeRate:
        row.total > 0 ? Math.round((row.closed / row.total) * 1000) / 10 : 0,
    }));
}

export function summarizeAnalytics(days: DailyAnalytics[]): AnalyticsSummary {
  const totalOrders = days.reduce((s, d) => s + d.totalOrders, 0);
  const closedOrders = days.reduce((s, d) => s + d.closedOrders, 0);
  const closedRevenue = days.reduce((s, d) => s + d.closedRevenue, 0);
  return {
    totalOrders,
    closedOrders,
    closedRevenue,
    closeRate:
      totalOrders > 0
        ? Math.round((closedOrders / totalOrders) * 1000) / 10
        : 0,
  };
}

/** from/to: YYYY-MM-DD (giờ VN), inclusive */
export function vnDateRangeToUtcIso(from: string, to: string) {
  const start = new Date(`${from}T00:00:00+07:00`).toISOString();
  const end = new Date(`${to}T23:59:59.999+07:00`).toISOString();
  return { start, end };
}

export function defaultAnalyticsRange(days = 30) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: VN_TZ }).format(d);
  return { from: fmt(start), to: fmt(end) };
}
