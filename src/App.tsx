/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './components/RootLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ConsultPage from './pages/ConsultPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="consult" element={<ConsultPage />} />
              <Route path="my-health" element={<DashboardPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
