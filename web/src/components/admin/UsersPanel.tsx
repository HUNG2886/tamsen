"use client";

import { useEffect, useState } from "react";
import type { Profile, UserRole } from "@/lib/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Quản trị",
  sale: "Sale",
  shipping: "Vận đơn",
};

export function UsersPanel() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "sale" as UserRole,
  });
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) setUsers(data.users);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setForm({ email: "", password: "", full_name: "", role: "sale" });
      load();
    } else {
      alert(data.error || "Lỗi tạo user");
    }
  }

  async function updateRole(id: string, role: UserRole) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) load();
    else alert("Không thể cập nhật");
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-semibold">Người dùng</h1>
        <p className="text-sm text-[#6f665c] mt-1">Quản lý tài khoản admin, sale, vận đơn</p>
      </header>

      <form
        onSubmit={createUser}
        className="bg-white border border-[#e0d6c8] p-5 mb-6 grid gap-3 sm:grid-cols-2"
      >
        <h2 className="sm:col-span-2 font-medium text-sm uppercase tracking-wider text-[#6f665c]">
          Tạo tài khoản mới
        </h2>
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border px-3 py-2 text-sm"
        />
        <input
          type="text"
          required
          placeholder="Họ tên"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="border px-3 py-2 text-sm"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
          className="border px-3 py-2 text-sm"
        >
          <option value="sale">Sale</option>
          <option value="shipping">Vận đơn</option>
          <option value="admin">Quản trị</option>
        </select>
        <button
          type="submit"
          disabled={creating}
          className="sm:col-span-2 py-2 bg-[#4d6358] text-white text-sm font-medium disabled:opacity-50"
        >
          {creating ? "Đang tạo..." : "Tạo tài khoản"}
        </button>
      </form>

      <div className="bg-white border border-[#e0d6c8] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f6f1e8] text-left text-xs uppercase tracking-wider text-[#6f665c]">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-[#ebe3d4]">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.full_name}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                      className="border px-2 py-1 text-sm bg-white"
                    >
                      {(["admin", "sale", "shipping"] as UserRole[]).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#6f665c]">
                    {new Date(u.created_at).toLocaleDateString("vi-VN")}
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
