// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { secureStorage } from "../../utils/encryption.js";

const PrivateRoute = ({ children }) => {
  // Use secureStorage to get user data (consistent with auth flow)
  const user = secureStorage.getItem("user");
  const authToken = secureStorage.getItem("authToken");
  
  console.log(user, authToken)
  // Check if user is authenticated (has both user data and token)
  const isAuthenticated = user && authToken;

  console.log(isAuthenticated)
  
  // return isAuthenticated ? children : <Navigate to="/auth" />;
};

export default PrivateRoute;
