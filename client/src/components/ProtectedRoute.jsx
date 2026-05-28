import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  const user = JSON.parse(
    sessionStorage.getItem("user")
  );

  const token =
    sessionStorage.getItem("token");

  if (!user || !token) {

    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;