/** Lỗi Postgres/PostgREST khi cột hoặc enum chưa có (migration chưa chạy). */
export function isSchemaMismatchError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("sale_status") ||
    m.includes("shipping_status") ||
    m.includes("column") ||
    m.includes("does not exist") ||
    m.includes("invalid input value for enum")
  );
}
