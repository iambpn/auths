import { CreatePermissionForm, CreatePermissionType } from "@/components/permission/createPermission.form";
import { axiosInstance } from "@/lib/axiosInstance";
import { handleError } from "@/lib/handleError";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function CreatePermission() {
  // update Permission Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    updateActiveNavLink(NavName.permission);
  }, []);

  const createPermissionMutationQuery = useMutation<APIResponse.Permission["POST-/"], unknown, CreatePermissionType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.post("/permission", values);
      return res.data;
    },
    onError(err) {
      handleError(err);
    },
    onSuccess() {
      toast.success("Permission Created");
      queryClient.invalidateQueries(["permission"], { exact: true });
      navigate("/permission");
    },
  });

  const onFormSubmit: SubmitHandler<CreatePermissionType> = (data) => {
    createPermissionMutationQuery.mutate(data);
  };

  return (
    <div>
      <div className='mb-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Add Permission</h1>
      </div>
      <CreatePermissionForm onSubmit={onFormSubmit} />
    </div>
  );
}
