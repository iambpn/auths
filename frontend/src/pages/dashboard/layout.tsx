import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useAppStore } from "@/store/useAppStore";
import { Outlet } from "react-router-dom";
import { GrClose, GrMenu } from "react-icons/gr";
import { cn } from "@/lib/utils";

type Props = {};

export function Layout(props: Props) {
  const openDrawer = useAppStore((state) => state.isDrawerOpen);
  const toggleOpenDrawer = useAppStore((state) => state.toggleOpenDrawer);

  return (
    <div className='h-screen flex flex-col'>
      <div className='w-full'>
        <Navbar />
      </div>
      <div className='md:container flex flex-grow p-2 md:p-4 overflow-clip'>
        <div className={cn(`lg:w-1/6 transition-[width] ease-in-out duration-500 h-full py-2`, openDrawer ? "w-2/6" : "w-0 overflow-clip")}>
          <Sidebar />
        </div>
        <div className='border w-full pl-2'>
          <div className={cn("pt-2 flex lg:hidden")}>
            <div onClick={() => toggleOpenDrawer()} className='hover:border-inherit border border-[transparent] rounded'>
              <GrMenu className={cn("h-5 transition-[width] ease-in-out delay-100", openDrawer && "w-0", !openDrawer && "w-5")} />
            </div>
            <div onClick={() => toggleOpenDrawer()} className='hover:border-inherit border border-[transparent] rounded'>
              <GrClose className={cn("h-5 transition-[width] ease-in-out delay-100", !openDrawer && "w-0", openDrawer && "w-5")} />
            </div>
          </div>
          <div className='pt-1 lg:p-8 lg:pt-6'>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
