;
import Auth from "./pages/Auth/Auth";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddEmployee from "./pages/Employee/AddEmployee";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/Private/PrivateRoute";
import AddCompany from "./components/AddCompany";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />{" "}
            </PrivateRoute>
          }
        />
        <Route
          path="/addemployee"
          element={
            <PrivateRoute>
              {" "}
              <AddEmployee />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-company"
          element={
            <PrivateRoute>
              <AddCompany />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Add more routes here as needed */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
