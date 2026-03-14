import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import AppLayout from './components/layout/AppLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// App Pages
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/inventory/ProductsPage';
import ProductFormPage from './pages/inventory/ProductFormPage';
import CategoriesPage from './pages/inventory/CategoriesPage';
import WarehousesPage from './pages/settings/WarehousesPage';
import OperationsListPage from './pages/operations/OperationsListPage';
import OperationFormPage from './pages/operations/OperationFormPage';
import StockMovesPage from './pages/inventory/StockMovesPage';
import ProfilePage from './pages/settings/ProfilePage';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="operations/receipts" element={<OperationsListPage opType="RECEIPT" title="Receipts" />} />
        <Route path="operations/receipts/new" element={<OperationFormPage opType="RECEIPT" title="Receipts" />} />
        <Route path="operations/receipts/:id" element={<OperationFormPage opType="RECEIPT" title="Receipts" />} />
        
        <Route path="operations/deliveries" element={<OperationsListPage opType="DELIVERY" title="Deliveries" />} />
        <Route path="operations/deliveries/new" element={<OperationFormPage opType="DELIVERY" title="Deliveries" />} />
        <Route path="operations/deliveries/:id" element={<OperationFormPage opType="DELIVERY" title="Deliveries" />} />

        <Route path="operations/transfers" element={<OperationsListPage opType="INTERNAL" title="Internal Transfers" />} />
        <Route path="operations/transfers/new" element={<OperationFormPage opType="INTERNAL" title="Internal Transfers" />} />
        <Route path="operations/transfers/:id" element={<OperationFormPage opType="INTERNAL" title="Internal Transfers" />} />

        <Route path="operations/adjustments" element={<OperationsListPage opType="ADJUSTMENT" title="Stock Adjustments" />} />
        <Route path="operations/adjustments/new" element={<OperationFormPage opType="ADJUSTMENT" title="Stock Adjustments" />} />
        <Route path="operations/adjustments/:id" element={<OperationFormPage opType="ADJUSTMENT" title="Stock Adjustments" />} />
        <Route path="moves" element={<StockMovesPage />} />
        <Route path="settings/warehouses" element={<WarehousesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
