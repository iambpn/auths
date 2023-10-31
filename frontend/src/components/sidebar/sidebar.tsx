import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { FaUserCheck, FaUserCog, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function Sidebar() {
  const activeNav = useAppStore((state) => state.activeNav);
  const setActiveNav = useAppStore((state) => state.setActiveNav);
  const updateActiveNavLink = (name: string) => {
    setActiveNav(name);
  };
  const currentUser = useAppStore.getState().currentUser;
  const name = currentUser!.email.split("@")[0];

  return (
    <div>
      <div className='px-2 py-2'>
        <h2 className='mb-2 px-4 text-lg font-medium tracking-tight whitespace-nowrap capitalize'>Hi, {name}</h2>
        <div className='space-y-1'>
          <Link to={"/users"} onClick={() => updateActiveNavLink(NavName.users)}>
            <Button variant={activeNav === NavName.users ? "default" : "ghost"} className='w-full justify-start'>
              <span>
                <FaUsers className='mr-2 h-4 w-4' />
              </span>
              <span>Users</span>
            </Button>
          </Link>
          <Link to={"/permission"} onClick={() => updateActiveNavLink(NavName.permission)}>
            <Button variant={activeNav === NavName.permission ? "default" : "ghost"} className='w-full justify-start'>
              <span>
                <FaUserCog className='mr-2 h-4 w-4' />
              </span>
              <span className='overflow-hidden'>Permission</span>
            </Button>
          </Link>
          <Link to={"/roles"} onClick={() => updateActiveNavLink(NavName.roles)}>
            <Button variant={activeNav === NavName.roles ? "default" : "ghost"} className='w-full justify-start'>
              <span>
                <FaUserCheck className='mr-2 h-4 w-4' />
              </span>
              <span>Roles</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
