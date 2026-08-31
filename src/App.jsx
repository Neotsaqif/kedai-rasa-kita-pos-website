import React, { useState } from "react";
import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  BarChart3,
  Users,
  LogOut,
  Coffee,
  Tag,
  Loader2,
  History,
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginScreen from "./components/LoginScreen";
import CategoryManager from "./components/CategoryManager";
import ProductManager from "./components/ProductManager";
import POSScreen from "./components/POSScreen";
import SalesHistory from "./components/SalesHistory";
import Dashboard from "./components/Dashboard";
import StaffAccounts from "./components/StaffAccounts";

function MainApp() {
  const { user, profile, logout, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("pos");

  if (authLoading) {
    return (
      <div className="h-screen bg-cream-50 flex items-center justify-center text-brand-900 font-semibold gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        <span>Memuat Kedai Rasa Kita POS...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const navItems = [
    { key: "pos", label: "Kasir", icon: ShoppingBag },
    { key: "history", label: "Riwayat", icon: History },
  ];

  if (isAdmin) {
    navItems.push(
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "products", label: "Produk", icon: Package },
      { key: "categories", label: "Kategori", icon: Tag },
      { key: "reports", label: "Laporan", icon: BarChart3 },
      { key: "users", label: "Akun Kasir", icon: Users },
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "pos":
        return <POSScreen cashierId={user.id} />;
      case "history":
        return <SalesHistory isAdmin={isAdmin} currentUserId={user.id} />;
      case "dashboard":
        return isAdmin ? <Dashboard /> : null;
      case "products":
        return isAdmin ? <ProductManager /> : null;
      case "categories":
        return isAdmin ? <CategoryManager /> : null;
      case "reports":
        return isAdmin ? (
          <SalesHistory isAdmin={isAdmin} currentUserId={user.id} />
        ) : null;
      case "users":
        return isAdmin ? <StaffAccounts /> : null;
      default:
        return <POSScreen cashierId={user.id} />;
    }
  };

  return (
    <div className="flex h-screen bg-cream-50 overflow-hidden">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 bg-brand-900 text-amber-50 flex-col justify-between p-4 shadow-xl select-none">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-amber-900/40">
            <div className="p-2 bg-brand-500 rounded-lg text-white">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">
                Kedai Rasa Kita
              </h1>
              <span className="text-xs text-amber-300/80">Kasir Digital</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === item.key
                      ? "bg-brand-500 text-white shadow-md"
                      : "text-amber-200/70 hover:bg-brand-900/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-amber-900/40 pt-4">
          <div className="px-3 py-2 mb-2 text-xs text-amber-300/60">
            Masuk sebagai:{" "}
            <strong className="text-amber-100">
              {profile?.name || user.email}
            </strong>
            <span className="block text-[10px] uppercase font-bold text-brand-500 mt-0.5">
              Role: {profile?.role === "admin" ? "Admin" : "Kasir"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-950/30 transition"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">{renderContent()}</div>

        {/* Bottom Tab Bar (tablet/mobile) */}
        <nav className="lg:hidden bg-white border-t border-brand-900/10 flex justify-around items-center px-2 py-2 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
                  isActive
                    ? "text-brand-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-red-400 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Keluar</span>
          </button>
        </nav>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
