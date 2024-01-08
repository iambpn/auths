import { RoleForm, RoleType } from "@/components/role/role.form";
import { axiosInstance } from "@/lib/axiosInstance";
import { handleError } from "@/lib/handleError";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function CreateRole() {
  // update Permission Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    updateActiveNavLink(NavName.roles);
  }, []);

  const createRoleMutationQuery = useMutation<APIResponse.Roles["POST-/"], unknown, RoleType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.post("/roles", values);
      return res.data;
    },
    onError(err) {
      handleError(err);
    },
    onSuccess() {
      toast.success("Role Created");
      queryClient.invalidateQueries(["roles"], { exact: true });
    },
  });

  const assignPermissionMutationQuery = useMutation<APIResponse.Roles["POST-assignPermission/id"], unknown, { data: RoleType; id: string }>({
    mutationFn: async (values) => {
      const res = await axiosInstance.post(`/roles/assignPermission/${values.id}`, {
        permissions: JSON.parse(values.data.selectedPermissions ?? "[]"),
      });
      return res.data;
    },
    onError(err) {
      handleError(err);
    },
    onSuccess(data, values) {
      toast.success("Role Permission Updated");
      queryClient.invalidateQueries(["roles", values.id]);
    },
  });

  const onFormSubmit: SubmitHandler<RoleType> = async (data) => {
    const role = await createRoleMutationQuery.mutateAsync(data);
    await assignPermissionMutationQuery.mutateAsync({ data: data, id: role.uuid });
    navigate("/roles");
  };

  return (
    <div>
      <div className='mb-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Add Roles</h1>
      </div>
      <RoleForm onSubmit={onFormSubmit} />
    </div>
  );
}
