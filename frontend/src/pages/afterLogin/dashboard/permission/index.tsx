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

export function ListPermission() {
  // update Permission Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);

  useEffect(() => {
    updateActiveNavLink(NavName.permission);
  }, []);

  const permissionQuery = useQuery<APIResponse.Permission["GET-/"]>({
    queryKey: ["permission", { page }],
    queryFn: async () => {
      const res = await axiosInstance.get(`/permission?page=${[page]}&limit=10`);
      return res.data;
    },
  });

  useEffect(() => {
    if (permissionQuery.isError) {
      handleError(permissionQuery.error);
    }
  }, [permissionQuery.error, permissionQuery.isError]);

  const deletePermissionMutationQuery = useMutation<APIResponse.Permission["DELETE-id"], unknown, { uuid: string }>({
    mutationFn: async (values) => {
      const res = await axiosInstance.delete(`/permission/${values.uuid}`);
      return res.data;
    },
    onError(error) {
      handleError(error);
    },
    onSuccess() {
      toast.success("Permission Deleted");
      queryClient.invalidateQueries(["permission"], { exact: true });
    },
  });

  const deletePermission = (uuid: string) => {
    deletePermissionMutationQuery.mutate({ uuid });
  };

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Permission</h1>
        <div>
          <Link to={"create"} className='inline-block'>
            <Button variant={"default"}>
              <div className='flex items-center'>
                <span className='mr-1'>
                  <IoMdAdd className='h-5 w-5' />
                </span>
                <span>Add Permission</span>
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
            {permissionQuery.data &&
              permissionQuery.data.permissions.map((permission) => (
                <TableRow key={permission.uuid}>
                  <TableCell className='capitalize'>{permission.name}</TableCell>
                  <TableCell className='font-medium'>{permission.slug}</TableCell>
                  <TableCell>{new Date(permission.updatedAt).toISOString()}</TableCell>
                  <TableCell>{new Date(permission.createdAt).toISOString()}</TableCell>
                  <TableCell>
                    <div className='space-x-3'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={permission.uuid} className='inline-block'>
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
                                  Are you sure, You want to delete <span className='capitalize'>`{permission.name}`</span> permission?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete selected permission from our database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePermission(permission.uuid)}>Continue</AlertDialogAction>
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
        {permissionQuery.data && permissionQuery.data.permissions.length > 0 && (
          <AddPagination currentPage={permissionQuery.data.currentPage} totalPage={permissionQuery.data.totalPage} setPage={setPage} />
        )}
      </div>
    </div>
  );
}
