import React from "react";
import Auth from "./pages/Auth/Auth";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddEmployee from "./pages/Employee/AddEmployee";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/addemployee" element={<AddEmployee />} />
        {/* Add more routes here as needed */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
