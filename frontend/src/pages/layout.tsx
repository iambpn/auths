import { LoadingSpinner } from "@/components/spinner/loadingSpinner";
import { axiosInstance } from "@/lib/axiosInstance";
import { useAppStore } from "@/store/useAppStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export function InitialLayout() {
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const currentUser = useAppStore.getState().currentUser;

  const { data, isError, isLoading, isSuccess, isPaused } = useQuery<APIResponse.Auths["cmsUser"]>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("currentUser");
      return res.data;
    },
    retry: 2,
    initialData: currentUser,
  });

  useEffect(() => {
    if (isError) {
      setCurrentUser(undefined);
    }

    if (isSuccess) {
      setCurrentUser(data);
    }
  }, [data, isError, isSuccess, setCurrentUser]);

  useEffect(() => {
    if (isPaused) {
      throw new Error("Oops...! No Internet Connection");
    }
  }, [isPaused]);

  return <div className='h-screen'>{isLoading ? <LoadingSpinner /> : <Outlet />}</div>;
}
