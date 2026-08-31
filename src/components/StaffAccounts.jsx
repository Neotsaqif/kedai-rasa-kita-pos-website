import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Loader2,
  X,
  Check,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function StaffAccounts() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setStaff(data || []);
    } catch (err) {
      console.error("Error loading staff:", err);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenModal = () => {
    setErrorMsg("");
    setFormData({ name: "", email: "", password: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMsg("Semua kolom wajib diisi.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      // Create auth user with role metadata
      const { data, error } = await supabase.auth.admin.createUser({
        email: formData.email.trim(),
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          name: formData.name.trim(),
          role: "cashier",
        },
      });

      if (error) throw error;

      // Ensure profile exists (trigger should handle it, but be safe)
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          name: formData.name.trim(),
          role: "cashier",
          is_active: true,
        },
        { onConflict: "id" },
      );
      if (profileError) throw profileError;

      setSuccessMsg(`Akun kasir "${formData.name.trim()}" berhasil dibuat.`);
      handleCloseModal();
      await fetchStaff();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Gagal membuat akun kasir.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (staffMember) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !staffMember.is_active })
        .eq("id", staffMember.id);
      if (error) throw error;
      await fetchStaff();
    } catch (err) {
      alert(err.message || "Gagal mengubah status akun.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-900/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            Akun Kasir
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Kelola akun staf dan akses kasir
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Kasir
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Memuat akun...</span>
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-brand-900/10 shadow-sm text-gray-500 text-sm">
          <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>Belum ada akun staf.</p>
          <p className="text-xs text-gray-400 mt-1">
            Klik "Tambah Kasir" untuk membuat akun baru.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-900/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-cream-50 text-xs font-semibold text-gray-700 uppercase border-b border-brand-900/10">
                <tr>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-cream-50/50 transition"
                  >
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {member.email || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          member.role === "admin"
                            ? "bg-brand-100 text-brand-700"
                            : "bg-cream-100 text-brand-900"
                        }`}
                      >
                        {member.role === "admin" ? "Admin" : "Kasir"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {member.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== "admin" && (
                        <button
                          onClick={() => handleToggleActive(member)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            member.is_active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {member.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Cashier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-900/10 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-600" />
                Tambah Kasir Baru
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Budi Santoso"
                  className="w-full px-4 py-2.5 bg-cream-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="kasir@kedairasakita.com"
                  className="w-full px-4 py-2.5 bg-cream-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kata Sandi Sementara
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-2.5 bg-cream-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Buat Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
