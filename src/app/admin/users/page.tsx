"use client";

import { useState, useEffect } from "react";
import { Users as UsersIcon, Plus, Loader2, Shield, UserCircle, X, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("admin");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(t("admin.sure"))) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail, password: newPassword, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Something went wrong.");
      } else {
        setCreateSuccess(`Account for ${newEmail} created successfully!`);
        setNewName(""); setNewEmail(""); setNewPassword("");
        fetchUsers();
      }
    } catch (e) {
      setCreateError("Unexpected error.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("admin.usersRoles")}</h1>
        <button
          onClick={() => { setShowCreate(true); setCreateError(""); setCreateSuccess(""); }}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> {t("admin.createAccount")}
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6">{t("admin.createNewAccount")}</h2>

            {createError && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{createError}</p>}
            {createSuccess && <p className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">{createSuccess}</p>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">{t("admin.fullName")}</label>
                <input type="text" required value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{t("admin.email")}</label>
                <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black" placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{t("admin.password")}</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{t("admin.role")}</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as any)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black">
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <button type="submit" disabled={creating}
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors flex justify-center items-center">
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : t("admin.createAccount")}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400" /></div>
        ) : users.length > 0 ? (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50">
              <tr className="border-b text-neutral-500">
                <th className="p-4 font-medium">{t("admin.userTh")}</th>
                <th className="p-4 font-medium">{t("admin.emailTh")}</th>
                <th className="p-4 font-medium">{t("admin.roleTh")}</th>
                <th className="p-4 font-medium">{t("admin.joined")}</th>
                <th className="p-4 font-medium text-right">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b last:border-0 hover:bg-neutral-50 transition-colors">
                  <td className="p-4 font-medium flex items-center gap-2">
                    {user.role === "admin" ? <Shield className="w-4 h-4 text-black" /> : <UserCircle className="w-4 h-4 text-neutral-400" />}
                    {user.name}
                  </td>
                  <td className="p-4 text-neutral-600">{user.email}</td>
                  <td className="p-4">
                    {updatingId === user._id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value as "user" | "admin")}
                        className={`border rounded-lg px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer ${
                          user.role === "admin" ? "bg-black text-white border-black" : "bg-neutral-100 text-neutral-700 border-neutral-200"
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="p-4 text-neutral-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={updatingId === user._id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                      title={t("admin.deleteBtn")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-neutral-500">
            <UsersIcon className="w-12 h-12 mb-3 opacity-20 mx-auto" />
            <p>{t("admin.noUsersYet")}</p>
            <button onClick={() => setShowCreate(true)}
              className="mt-4 text-sm font-semibold text-black hover:underline">{t("admin.createFirstAdmin")}</button>
          </div>
        )}
      </div>
    </div>
  );
}
