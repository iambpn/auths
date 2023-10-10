import { Navbar } from "@/components/navbar/navbar";
import { Outlet } from "react-router-dom";

export default function AfterLoginLayout() {
  return (
    <div className='h-full flex flex-col'>
      <div className='w-full'>
        <Navbar />
      </div>
      <div className='h-full'>
        <Outlet />
      </div>
    </div>
  );
}
