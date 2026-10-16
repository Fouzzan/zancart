import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="my-[25%] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
