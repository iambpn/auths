import { currentUser } from "@/types/common_types";
import { axiosInstance } from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";

export function InitialLayout() {
  const { data, isError, isLoading, error } = useQuery<currentUser>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("currentUser");
      return res.data;
    },
  });

  console.log(error);

  return (
    <div className='h-screen'>
      <Outlet />
    </div>
  );
}
