/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './features/auth/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { PosPage } from './features/pos/PosPage';
import { AdminDashboard } from './features/dashboard/AdminDashboard';
import { ProductManagementPage } from './features/products/ProductManagementPage';
import { StockManagementPage } from './features/stock/StockManagementPage';
import { SalesHistoryPage } from './features/sales/SalesHistoryPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { UserManagementPage } from './features/users/UserManagementPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ToastContainer } from './components/ui/Toast';

const AppContent: React.FC = () => {
  const { currentUser, activeTab } = useApp();

  // If user is not logged in, show the role-switching Login Page
  if (!currentUser) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // Render content based on activeTab and permissions
  const renderActiveView = () => {
    switch (activeTab) {
      case 'pos':
        return <PosPage />;
      case 'dashboard':
        return currentUser.role === 'ADMIN' ? <AdminDashboard /> : <PosPage />;
      case 'products':
        return <ProductManagementPage />;
      case 'stock':
        return <StockManagementPage />;
      case 'sales':
        return <SalesHistoryPage />;
      case 'reports':
        return <ReportsPage />;
      case 'users':
        return <UserManagementPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <PosPage />;
    }
  };

  return (
    <AppLayout>
      {renderActiveView()}
      <ToastContainer />
    </AppLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
