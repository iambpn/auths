import { UpdateRoleForm, UpdateRoleType } from "@/components/role/updateRole.form";
import { axiosInstance } from "@/lib/axiosInstance";
import { handleError } from "@/lib/handleError";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export function EditRole() {
  // update Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    updateActiveNavLink(NavName.roles);
  }, []);

  const RoleByIdQuery = useQuery<APIResponse.Roles["GET-id"]>({
    queryKey: ["roles", params.id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/roles/${params.id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (RoleByIdQuery.isError) {
      handleError(RoleByIdQuery.error);
    }
  }, [RoleByIdQuery.error, RoleByIdQuery.isError]);

  const rolesMutationQuery = useMutation<APIResponse.Roles["PUT-id"], unknown, UpdateRoleType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.put(`/roles/${params.id}`, {
        name: values.name,
        slug: values.slug,
        updatedPermission: JSON.parse(values.selectedPermissions ?? "[]"),
      });
      return res.data;
    },
    onError(err) {
      handleError(err);
    },
    onSuccess() {
      toast.success("Role Edited");
      queryClient.invalidateQueries(["roles"]);
    },
  });

  const assignPermissionMutationQuery = useMutation<APIResponse.Roles["POST-assignPermission/id"], unknown, UpdateRoleType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.post(`/roles/assignPermission/${params.id}`, {
        permissions: JSON.parse(values.selectedPermissions ?? "[]"),
      });
      return res.data;
    },
    onError(err) {
      handleError(err);
    },
    onSuccess() {
      toast.success("Role Permission Updated");
      queryClient.invalidateQueries(["roles", params.id]);
    },
  });

  const onFormSubmit: SubmitHandler<UpdateRoleType> = async (data) => {
    await rolesMutationQuery.mutateAsync(data);
    await assignPermissionMutationQuery.mutateAsync(data);
    navigate("/roles");
  };

  return (
    <div>
      <div className='mb-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Edit Roles</h1>
      </div>
      {RoleByIdQuery.data && <UpdateRoleForm onSubmit={onFormSubmit} defaultValue={{ name: RoleByIdQuery.data.name, slug: RoleByIdQuery.data.slug }} permissions={RoleByIdQuery.data.permissions} />}
    </div>
  );
}
