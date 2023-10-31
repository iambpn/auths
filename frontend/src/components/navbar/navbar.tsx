import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { AvatarComponent } from "../avatar/avatar.component";
import { Button } from "../ui/button";
import { useAppStore } from "@/store/useAppStore";

export function Navbar() {
  const currentUser = useAppStore.getState().currentUser;
  const name = currentUser!.email.split("@")[0];

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
            <AvatarComponent link='' fallBackText={name.substring(0, 2)} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56'>
          <DropdownMenuLabel>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none capitalize'>{currentUser?.email.split("@")[0]}</p>
              <p className='text-xs leading-none text-muted-foreground'>{currentUser?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link to={"/settings"}>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <Link to={"/logout"}>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
