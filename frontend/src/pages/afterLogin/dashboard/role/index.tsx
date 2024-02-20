import { AddPagination } from "@/components/addPagination";
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
import { useEffect, useState } from "react";
import { BiEditAlt } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function ListRoles() {
  // update Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);

  useEffect(() => {
    updateActiveNavLink(NavName.roles);
  }, []);

  const rolesQuery = useQuery<APIResponse.Roles["GET-/"]>({
    queryKey: ["roles", { page }],
    queryFn: async () => {
      const res = await axiosInstance.get(`/roles?page=${page}&limit=10`);
      return res.data;
    },
  });

  useEffect(() => {
    if (rolesQuery.isError) {
      handleError(rolesQuery.error);
    }
  }, [rolesQuery.error, rolesQuery.isError]);

  const deleteRoleMutationQuery = useMutation<APIResponse.Roles["DELETE-id"], unknown, { uuid: string }>({
    mutationFn: async (values) => {
      const res = await axiosInstance.delete(`/roles/${values.uuid}`);
      return res.data;
    },
    onError(error) {
      handleError(error);
    },
    onSuccess() {
      toast.success("Role Deleted");
      queryClient.invalidateQueries(["roles"], { exact: true });
    },
  });

  const deleteRole = (uuid: string) => {
    deleteRoleMutationQuery.mutate({ uuid });
  };

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Roles</h1>
        <div>
          <Link to={"create"} className='inline-block'>
            <Button variant={"default"}>
              <div className='flex items-center'>
                <span className='mr-1'>
                  <IoMdAdd className='h-5 w-5' />
                </span>
                <span>Add Role</span>
              </div>
            </Button>
          </Link>
        </div>
      </div>
      <div className='pt-2'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rolesQuery.data &&
              rolesQuery.data.roles.map((role) => (
                <TableRow key={role.uuid}>
                  <TableCell className='capitalize'>{role.name}</TableCell>
                  <TableCell className='font-medium'>{role.slug}</TableCell>
                  <TableCell>{new Date(role.updatedAt).toISOString()}</TableCell>
                  <TableCell>{new Date(role.createdAt).toISOString()}</TableCell>
                  <TableCell>
                    <div className='space-x-3'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={role.uuid} className='inline-block'>
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
                                  Are you sure, You want to delete <span className='capitalize'>`{role.name}`</span> role?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete selected role from our database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteRole(role.uuid)}>Continue</AlertDialogAction>
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
        {rolesQuery.data && rolesQuery.data.roles.length > 0 && (
          <AddPagination currentPage={rolesQuery.data.currentPage} totalPage={rolesQuery.data.totalPage} setPage={setPage} />
        )}
      </div>
    </div>
  );
}
