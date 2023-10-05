import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AvatarComponent } from "./avatar.component";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <div className='flex justify-between py-2 px-3 shadow'>
      <div>
        <Link to={"/users"}>
          <h2 className='text-lg font-semibold tracking-tight'>Auths</h2>
        </Link>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <AvatarComponent link='https://github.com/shadcn.png' fallBackText='BM' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56'>
          <DropdownMenuLabel>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none capitalize'>user</p>
              <p className='text-xs leading-none text-muted-foreground'>email@email.com</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Change Password</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
