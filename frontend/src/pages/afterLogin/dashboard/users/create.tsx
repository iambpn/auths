import { UserFrom, UserType } from "@/components/user/user.form";
import { axiosInstance } from "@/lib/axiosInstance";
import { handleError } from "@/lib/handleError";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function CreateUser() {
  // update Permission Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    updateActiveNavLink(NavName.users);
  }, []);

  const createUserMutationQuery = useMutation<APIResponse.Users["POST-/"], unknown, UserType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.post("/users/", values);
      return res.data;
    },
    onError(err) {
      handleError(err);
    },
    onSuccess() {
      toast.success("User Created");
      queryClient.invalidateQueries(["users"], { exact: true });
      navigate("/users");
    },
  });

  const onSubmitHandler: SubmitHandler<UserType> = (data) => {
    createUserMutationQuery.mutate(data);
  };

  return (
    <div>
      <div className='mb-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Add User</h1>
      </div>
      <UserFrom onSubmit={onSubmitHandler} />
    </div>
  );
}
