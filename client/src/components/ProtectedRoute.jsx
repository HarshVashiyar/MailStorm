import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      navigate("/SignIn", { replace: true });
      toast.error("Please log in first.");
      return;
    }
    try {
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      navigate("/SignIn", { replace: true });
    }
  }, [navigate]);

  if ((!isAuthenticated) || redirecting) {
    return (
      <div>
        <h1 style={{ color: "red" }}>Please log in first.</h1>
      </div>
    );
  }
  return <Outlet />;
};

export default ProtectedRoute;
