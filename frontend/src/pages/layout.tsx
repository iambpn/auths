import { LoadingSpinner } from "@/components/spinner/loadingSpinner";
import { useAppStore } from "@/store/useAppStore";
import { currentUser } from "@/types/common_types";
import { axiosInstance } from "@/utils/axiosInstance";
import { handleError } from "@/utils/handleError";
import { useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";

export function InitialLayout() {
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  //  read only wont trigger rerender
  const currentUser = useAppStore.getState().currentUser;

  const { data, isError, isLoading, error, isSuccess } = useQuery<currentUser>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("currentUser");
      return res.data;
    },
    retry: 2,
    initialData: currentUser,
  });

  if (isError) {
    handleError(error);
    setCurrentUser(undefined);
  }

  if (isSuccess) {
    setCurrentUser(data);
  }

  return <div className='h-screen'>{isLoading ? <LoadingSpinner /> : <Outlet />}</div>;
}
