import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Guest from "./pages/Guest";
import Admin from "./pages/Admin";
import CreateGuest from "./components/Register";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<CreateGuest/>} />
      </Routes>
    </Router>
  );
};

export default App;
