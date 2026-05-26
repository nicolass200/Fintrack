import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { CategoriesPage } from "./pages/categories/CategoriesPage";
import { TransactionsPage } from "./pages/transactions/TransactionsPage";
import { BudgetsPage } from "./pages/budgets/BudgetsPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { PrivateRoute } from "./routes/PrivateRoute";
import { AppLayout } from "./layouts/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route
            path="/transactions/new"
            element={<TransactionsPage mode="form" />}
          />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
