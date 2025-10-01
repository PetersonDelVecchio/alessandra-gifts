import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Guest from "./pages/Guest";
import Admin from "./pages/Admin";
import Invite from "./pages/Invite";
import ThemePage from "./pages/ThemePage";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/guest"
          element={
            <GuestRoute>
              <Guest />
            </GuestRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/invite" element={<Invite />} />
        <Route
          path="/theme"
          element={
            <ProtectedRoute>
              <ThemePage />
            </ProtectedRoute>
          }
        />
        {/* Outras rotas */}
      </Routes>
    </Router>
  );
};

// Componente para redirecionar baseado no tipo de usuário
const RootRedirect: React.FC = () => {
  const userType = localStorage.getItem("userType");
  
  if (userType === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (userType === "guest") {
    return <Navigate to="/guest" replace />;
  }
  return <Navigate to="/login" replace />;
};

export default App;
