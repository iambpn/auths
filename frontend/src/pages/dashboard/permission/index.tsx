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
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";
import { BiEditAlt } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";
import { Link } from "react-router-dom";

export function Permission() {
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  useEffect(() => {
    updateActiveNavLink(NavName.permission);
  }, []);
  return (
    <div>
      <div className=''>
        <h1 className='text-3xl font-bold tracking-tight'>Permission</h1>
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
            <TableRow key={""}>
              <TableCell>SuperAdmin</TableCell>
              <TableCell className='font-medium'>super-admin</TableCell>
              <TableCell>{new Date().toISOString()}</TableCell>
              <TableCell>{new Date().toISOString()}</TableCell>
              <TableCell>
                <div className='space-x-3'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={"/permission"} className='inline-block'>
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
                            <AlertDialogTitle>Are you sure, You want to delete '$$' permission?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete selected permission from our database.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => console.log("deleted")}>Continue</AlertDialogAction>
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
