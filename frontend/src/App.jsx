import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Board } from './pages/Board';

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);
  const { isDark, setTheme } = useThemeStore();

  useEffect(() => {
    checkAuth();
    setTheme(isDark);
  }, [checkAuth, isDark, setTheme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        <Route path="/board/:id" element={<ProtectedRoute><Board /></ProtectedRoute>}/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
