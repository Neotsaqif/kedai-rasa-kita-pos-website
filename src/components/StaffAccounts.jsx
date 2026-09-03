import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Loader2,
  X,
  Check,
  UserPlus,
  AlertTriangle,
  Power,
  Shield,
  User,
} from "lucide-react";
import {
  fetchProfiles as apiFetchProfiles,
  createCashier as apiCreateCashier,
  toggleUserActive as apiToggleUserActive,
} from "../lib/data";

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
      const data = await apiFetchProfiles();
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
      // Create the cashier account (handles both MySQL & Supabase backends)
      await apiCreateCashier({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccessMsg(`Akun kasir "${formData.name.trim()}" berhasil dibuat.`);
      handleCloseModal();
      await fetchStaff();

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Gagal membuat akun kasir.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (staffMember) => {
    try {
      await apiToggleUserActive(staffMember.id, !staffMember.is_active);
      await fetchStaff();
    } catch (err) {
      alert(err.message || "Gagal mengubah status akun.");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-sans text-brand-900 bg-cream-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-cream-200 p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-500" />
            <h1 className="text-xl font-bold text-brand-900 font-serif-heading">
              Kelola Pengguna &amp; Akun Staf
            </h1>
          </div>
          <p className="text-xs text-brand-500/70 mt-1">
            Kelola data staf kasir, pemberian wewenang akun, serta status aktif/nonaktif akses POS.
          </p>
        </div>

        <button
          id="btn-add-staff"
          onClick={handleOpenModal}
          className="bg-brand-500 hover:bg-brand-900 text-white font-bold px-5 py-2.5 text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Kasir Baru
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Staff List Grid */}
      {loading ? (
        <div className="bg-white border border-cream-200 p-12 text-center text-brand-500/60 flex items-center justify-center gap-2 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          <span>Memuat data pengguna...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((u) => {
            const isAdminRole = u.role === "admin";
            const isActive = u.is_active ?? true;

            return (
              <div
                key={u.id}
                className="bg-white border border-cream-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cream-100 border border-cream-200 flex items-center justify-center text-brand-500 font-bold shrink-0">
                      {isAdminRole ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-900 font-serif-heading">
                        {u.name}
                      </h3>
                      <span className="text-xs text-brand-500/70 block">
                        {u.email || `${u.name.toLowerCase().replace(/\s+/g, ".")}@kedai.com`}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 border uppercase ${
                      isAdminRole
                        ? "bg-brand-500 text-white border-brand-500"
                        : "bg-cream-100 text-brand-500 border-cream-200"
                    }`}
                  >
                    {u.role || "cashier"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-cream-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-500/70">Status:</span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Nonaktif
                      </span>
                    )}
                  </div>

                  {!isAdminRole && (
                    <button
                      id={`btn-toggle-staff-${u.id}`}
                      onClick={() => handleToggleActive(u)}
                      className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                        isActive
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Cashier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-xs">
          <div className="bg-white border border-cream-200 w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 bg-cream-100 border-b border-cream-200">
              <h3 className="text-base font-bold text-brand-900 font-serif-heading flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-500" />
                Tambah Kasir Baru
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-brand-500/70 hover:text-brand-900 p-1 hover:bg-cream-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="m-6 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-brand-500 uppercase mb-1">
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
                  className="w-full bg-cream-100 border border-cream-200 px-4 py-2.5 text-brand-900 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-500 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="kasir@rasakita.id"
                  className="w-full bg-cream-100 border border-cream-200 px-4 py-2.5 text-brand-900 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-500 uppercase mb-1">
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
                  className="w-full bg-cream-100 border border-cream-200 px-4 py-2.5 text-brand-900 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-cream-200 text-brand-500 hover:bg-cream-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-900 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
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
