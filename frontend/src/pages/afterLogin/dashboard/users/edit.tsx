import { UserType } from "@/components/user/user.form";
import { axiosInstance } from "@/lib/axiosInstance";
import { handleError } from "@/lib/handleError";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export function EditUser() {
  // update Permission Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    updateActiveNavLink(NavName.users);
  }, []);

  const userByIdQuery = useQuery<APIResponse.Users["GET-id"]>({
    queryKey: ["user", params.id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/users/${params.id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (userByIdQuery.isError) {
      handleError(userByIdQuery.error);
    }
  }, [userByIdQuery.error, userByIdQuery.isError]);

  const userMutationQuery = useMutation<APIResponse.Permission["PUT-id"], unknown, UserType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.put(`/users/${params.id}`, {
        //  todo
      });
      return res.data;
    },
    onError(err) {
      handleError(err);
    },
    onSuccess() {
      toast.success("User Edited");
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["user", params.id]);
    },
  });

  const onFormSubmit: SubmitHandler<UserType> = async (data) => {
    await userMutationQuery.mutateAsync(data);
    navigate("/user");
  };

  return (
    <div>
      <div className='mb-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Edit Permission</h1>
      </div>
      {userByIdQuery.data && (
        <PermissionForm
          onSubmit={onFormSubmit}
          defaultValue={{ name: userByIdQuery.data.name, slug: userByIdQuery.data.slug }}
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
