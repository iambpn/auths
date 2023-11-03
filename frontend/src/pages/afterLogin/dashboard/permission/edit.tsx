import { UpdatePermissionForm, UpdatePermissionType } from "@/components/permission/updatePermission.form";
import { axiosInstance } from "@/lib/axiosInstance";
import { PAGE_LIMIT } from "@/lib/config";
import { handleError } from "@/lib/handleError";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export function EditPermission() {
  // update Permission Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    updateActiveNavLink(NavName.permission);
  }, []);

  const PermissionByIdQuery = useQuery<APIResponse.Permission["GET-id"]>({
    queryKey: ["permission", params.id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/permission/${params.id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (PermissionByIdQuery.isError) {
      handleError(PermissionByIdQuery.error);
    }
  }, [PermissionByIdQuery.error, PermissionByIdQuery.isError]);

  const RolesByPermissionInfiniteQuery = useInfiniteQuery<APIResponse.Permission["GET-id/roles"]>({
    queryKey: ["permission", params.id, "roles"],
    queryFn: async (ctx) => {
      const res = await axiosInstance.get(`/permission/${params.id}/roles`, {
        params: {
          page: ctx.pageParam ?? 0,
          limit: PAGE_LIMIT,
        },
      });
      return res.data;
    },
  });

  useEffect(() => {
    if (RolesByPermissionInfiniteQuery.isError) {
      handleError(RolesByPermissionInfiniteQuery.error);
    }
  }, [RolesByPermissionInfiniteQuery.error, RolesByPermissionInfiniteQuery.isError]);

  const permissionMutationQuery = useMutation<APIResponse.Permission["PUT-id"], unknown, UpdatePermissionType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.put(`/permission/${params.id}`, {
        name: values.name,
        slug: values.slug,
      });
      return res.data;
    },
    onError(err) {
      handleError(err);
    },
    onSuccess() {
      toast.success("Permission Edited");
      queryClient.invalidateQueries(["permission"]);
    },
  });

  const assignRolesMutationQuery = useMutation<APIResponse.Permission["POST-assignRoles/id"], unknown, UpdatePermissionType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.post(`/permission/assignRoles/${params.id}`, {
        roles: JSON.parse(values.selectedRoles ?? "[]"),
      });
      return res.data;
    },
    onError(err) {
      handleError(err);
    },
    onSuccess() {
      toast.success("Permission Roles Updated");
      queryClient.invalidateQueries(["permission", params.id]);
    },
  });

  const onFormSubmit: SubmitHandler<UpdatePermissionType> = async (data) => {
    await permissionMutationQuery.mutateAsync(data);
    await assignRolesMutationQuery.mutateAsync(data);
    navigate("/permission");
  };

  return (
    <div>
      <div className='mb-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Edit Permission</h1>
      </div>
      {PermissionByIdQuery.data && (
        <UpdatePermissionForm
          onSubmit={onFormSubmit}
          defaultValue={{ name: PermissionByIdQuery.data.name, slug: PermissionByIdQuery.data.slug }}
          roles={RolesByPermissionInfiniteQuery?.data?.pages.flatMap((x) => x.roles) ?? []}
          onScroll={() => {
            if (RolesByPermissionInfiniteQuery.hasNextPage) {
              RolesByPermissionInfiniteQuery.fetchNextPage();
            }
          }}
        />
      )}
    </div>
  );
}
