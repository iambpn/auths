import { AvatarComponent } from "@/components/avatar.component";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

export function Users() {
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  useEffect(() => {
    updateActiveNavLink(NavName.users);
  }, []);

  return (
    <div className=''>
      <h1 className='text-3xl font-bold tracking-tight'>Users</h1>
      <div>
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
            <TableRow key={""}>
              <TableCell className='pl-2 md:pl-5'>
                <AvatarComponent fallBackText='' link='' />
              </TableCell>
              <TableCell className='font-medium capitalize'>email@email.com</TableCell>
              <TableCell>SuperAdmin</TableCell>
              <TableCell>{new Date().toISOString()}</TableCell>
              <TableCell>{new Date().toISOString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
