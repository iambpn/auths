import { useAppStore } from "@/store/useAppStore";
import { Navigate } from "react-router-dom";

export function BlockOnAuth({ children }: { children: JSX.Element }) {
  const loggedInUser = useAppStore((state) => state.currentUser);
  const historyState = window.history.state;

  if (loggedInUser) {
    return <Navigate to={historyState?.usr?.from ?? "/users"} replace />;
  }

  return children;
}
