import { AvatarComponent } from "@/components/avatar/avatar.component";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { axiosInstance } from "@/lib/axiosInstance";
import { handleError } from "@/lib/handleError";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { BiEditAlt } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function Users() {
  // update Permission Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);

  const queryClient = useQueryClient();

  useEffect(() => {
    updateActiveNavLink(NavName.users);
  }, []);

  const UsersQuery = useQuery<APIResponse.Users["GET-/"]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users?page=0&limit=10");
      return res.data;
    },
  });

  useEffect(() => {
    if (UsersQuery.isError) {
      handleError(UsersQuery.error);
    }
  }, [UsersQuery.error, UsersQuery.isError]);

  const deleteUserMutationQuery = useMutation<APIResponse.Users["DELETE-id"], unknown, { uuid: string }>({
    mutationFn: async (values) => {
      const res = await axiosInstance.delete(`/users/${values.uuid}`);
      return res.data;
    },
    onError(error) {
      handleError(error);
    },
    onSuccess() {
      toast.success("User Deleted");
      queryClient.invalidateQueries(["users"], { exact: true });
    },
  });

  const deleteUser = (uuid: string) => {
    deleteUserMutationQuery.mutate({ uuid });
  };

  return (
    <div className=''>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Users</h1>
        <div>
          <Link to={"create"} className='inline-block'>
            <Button variant={"default"}>
              <div className='flex items-center'>
                <span className='mr-1'>
                  <IoMdAdd className='h-5 w-5' />
                </span>
                <span>Add Users</span>
              </div>
            </Button>
          </Link>
        </div>
      </div>
      <div className='pt-2'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {UsersQuery.data &&
              UsersQuery.data.users.map((user) => (
                <TableRow key={user.uuid}>
                  <TableCell className='pl-2 md:pl-5'>
                    <AvatarComponent fallBackText={user.email.split("@")[0].substring(0, 2)} link='' />
                  </TableCell>
                  <TableCell className='font-medium capitalize'>{user.email}</TableCell>
                  <TableCell className='capitalize'>{user.role.name}</TableCell>
                  <TableCell>{new Date(user.updatedAt).toISOString()}</TableCell>
                  <TableCell>{new Date(user.createdAt).toISOString()}</TableCell>
                  <TableCell>
                    <div className='space-x-3'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={user.uuid} className='inline-block'>
                              <Button variant={"outline"} size={"icon"}>
                                <BiEditAlt className={"h-4 w-4"} />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent align='center'>
                            <p>Edit</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <TooltipTrigger asChild>
                                <Button variant={"destructive"} size={"icon"}>
                                  <MdDeleteOutline className='h-4 w-4' />
                                </Button>
                              </TooltipTrigger>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure, You want to delete <span className='capitalize'>`{user.email}`</span> user?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete selected permission from our database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteUser(user.uuid)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
