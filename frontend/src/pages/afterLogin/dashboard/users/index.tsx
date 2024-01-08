import { AvatarComponent } from "@/components/avatar/avatar.component";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { axiosInstance } from "@/lib/axiosInstance";
import { handleError } from "@/lib/handleError";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { Link } from "react-router-dom";

export function Users() {
  // update Permission Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
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
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
