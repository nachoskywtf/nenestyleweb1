import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSecureItem } from "../utils/encryption";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    // Simplified check - only verify token exists
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  return <>{children}</>;
};

export default ProtectedRoute;
