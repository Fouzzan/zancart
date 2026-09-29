import { useUser } from "@clerk/react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
