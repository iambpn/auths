import { PermissionForm, PermissionType } from "@/components/permission/permission.form";
import { axiosInstance } from "@/lib/axiosInstance";
import { handleError } from "@/lib/handleError";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  const PermissionByIdQuery = useQuery<{
    createdAt: Date;
    name: string;
    slug: string;
    uuid: string;
    updatedAt: Date;
  }>({
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

  const permissionMutationQuery = useMutation<
    {
      createdAt: Date;
      name: string;
      slug: string;
      uuid: string;
      updatedAt: Date;
    },
    unknown,
    PermissionType
  >({
    mutationFn: async (values) => {
      const res = await axiosInstance.put(`/permission/${params.id}`, values);
      return res.data;
    },
    onError(err) {
      handleError(err);
    },
    onSuccess() {
      toast.success("Permission Edited");
      queryClient.invalidateQueries(["permission"]);
      navigate("/permission");
    },
  });

  const onFormSubmit: SubmitHandler<PermissionType> = async (data) => {
    await permissionMutationQuery.mutateAsync(data);
  };

  return (
    <div>
      <div className='mb-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Edit Permission</h1>
      </div>
      {PermissionByIdQuery.data && <PermissionForm onSubmit={onFormSubmit} defaultValue={{ name: PermissionByIdQuery.data.name, slug: PermissionByIdQuery.data.slug }} />}
    </div>
  );
}
