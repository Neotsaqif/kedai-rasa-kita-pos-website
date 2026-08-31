import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ShieldCheck, UserCheck, Loader2 } from "lucide-react";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Harap isi email dan password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.message || "Gagal masuk. Periksa kembali email & password Anda.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-brand-900">
      {/* Background Decorative Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-cream-200 shadow-xl overflow-hidden z-10">
        {/* Header Branding */}
        <div className="bg-brand-500 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 mx-auto flex items-center justify-center mb-3 shadow-inner border border-white/20 text-white font-bold text-xl font-serif-heading">
            KRK
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-serif-heading">
            Kedai Rasa Kita
          </h1>
          <p className="text-white/80 text-xs mt-1 font-medium uppercase tracking-widest italic">
            Sales Terminal • Login Account
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-brand-500 uppercase tracking-wider mb-2">
                Email Pengguna
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-brand-500/60 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: admin@rasakita.id"
                  className="w-full bg-cream-100 text-brand-900 border border-cream-200 py-3 pl-11 pr-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all placeholder:text-brand-500/60"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-500 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-brand-500/60 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cream-100 text-brand-900 border border-cream-200 py-3 pl-11 pr-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all placeholder:text-brand-500/60"
                  required
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-900 text-white font-bold py-3.5 px-4 text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk ke Sistem POS</span>
              )}
            </button>
          </form>

          {/* Demo Quick Logins */}
          <div className="mt-8 pt-6 border-t border-cream-200">
            <p className="text-xs text-brand-500/70 font-semibold mb-3 text-center uppercase tracking-wider">
              Uji Coba Cepat (Demo Logins):
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-demo-admin"
                type="button"
                onClick={() => fillQuickLogin("admin@rasakita.id", "password123")}
                className="flex items-center justify-center gap-2 p-2.5 bg-cream-100 hover:bg-cream-200 border border-cream-200 text-brand-900 text-xs font-semibold transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                Admin (Owner)
              </button>
              <button
                id="btn-demo-cashier"
                type="button"
                onClick={() => fillQuickLogin("kasir@rasakita.id", "password123")}
                className="flex items-center justify-center gap-2 p-2.5 bg-cream-100 hover:bg-cream-200 border border-cream-200 text-brand-900 text-xs font-semibold transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-700" />
                Kasir POS
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-brand-500/70 font-medium">
        &copy; 2026 Kedai Rasa Kita &bull; F&amp;B Point of Sale Indonesia
      </div>
    </div>
  );
}
