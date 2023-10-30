import { useAppStore } from "@/store/useAppStore";
import { setToken } from "@/lib/localstorage";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function Logout() {
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  useEffect(() => {
    setToken("");
    setCurrentUser(undefined);
  }, []);

  return (
    <>
      <Navigate to='/' replace={true} />
    </>
  );
}
