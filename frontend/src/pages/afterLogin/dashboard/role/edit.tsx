import { AssignPermissionToRole } from "@/components/role/role.assignPermisson";
import { RoleForm, RoleType } from "@/components/role/role.form";
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

  // const PermissionInfiniteQuery = useInfiniteQuery({
  //   queryKey: ["permission", "infinite"],
  //   getNextPageParam: (prevData) => {
  //     // return page + 1;
  //   },
  //   queryFn: (ctx) => {
  //     // // ctx.pageParam is provided by useInfiniteQuery
  //     // // call api with page data
  //     // return wait(2000).then(() => POSTS[ctx.pageParam ?? 1]);
  //   },
  // });

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

  const rolesMutationQuery = useMutation<APIResponse.Roles["PUT-id"], unknown, RoleType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.put(`/roles/${params.id}`, values);
      return res.data;
    },
    onError(err) {
      handleError(err);
    },
    onSuccess() {
      toast.success("Role Edited");
      queryClient.invalidateQueries(["roles"]);
      navigate("/roles");
    },
  });

  const onFormSubmit: SubmitHandler<RoleType> = (data) => {
    rolesMutationQuery.mutate(data);
  };

  return (
    <div>
      <div className='mb-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Edit Roles</h1>
      </div>
      {RoleByIdQuery.data && <RoleForm onSubmit={onFormSubmit} defaultValue={{ name: RoleByIdQuery.data.name, slug: RoleByIdQuery.data.slug }} />}
      <AssignPermissionToRole />
    </div>
  );
}
