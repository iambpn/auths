import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useAppStore } from "@/store/useAppStore";
import { Outlet } from "react-router-dom";

type Props = {};

export function Layout(props: Props) {
  const openDrawer = useAppStore((state) => state.isDrawerOpen);
  return (
    <div className="h-screen flex flex-col">
      <div className='w-full'>
        <Navbar />
      </div>
      <div className='md:container flex flex-grow p-4'>
        <div className={`border overflow-hidden lg:w-1/6 transition-[width] ease-in-out duration-500 ${openDrawer ? "w-2/6" : "w-0"} h-full py-2`}>
          <Sidebar />
        </div>
        <div className='border w-full p-2'>{<Outlet />}</div>
      </div>
    </div>
  );
}
