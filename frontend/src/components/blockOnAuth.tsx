import { useAppStore } from "@/store/useAppStore";
import { Navigate } from "react-router-dom";

export function BlockOnAuth({ children }: { children: JSX.Element }) {
  const loggedInUser = useAppStore((state) => state.currentUser);

  if (loggedInUser) {
    return <Navigate to='/users' replace />;
  }

  return children;
}
