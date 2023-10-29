import { useAppStore } from "@/store/useAppStore";
import { setToken } from "@/utils/localstorage";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function Logout() {
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  //  TODO: FIX LOGOUT ISSUE

  useEffect(() => {
    setToken("");
    // setCurrentUser(undefined);
  }, []);

  return (
    <>
      <Navigate to='/' replace={true} />
    </>
  );
}
