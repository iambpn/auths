import { useAppStore } from "@/store/useAppStore";
import { Navigate, useLocation } from "react-router-dom";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const loggedInUser = useAppStore((state) => state.currentUser);
  const location = useLocation();

  if (!loggedInUser) {
    return <Navigate to='/' state={{ from: location.pathname }} replace />;
  }

  return children;
}
