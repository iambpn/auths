import { Navbar } from "@/components/navbar";
import { Outlet } from "react-router-dom";

export default function AfterLoginLayout() {
  return (
    <div className='h-screen flex flex-col'>
      <div className='w-full'>
        <Navbar />
      </div>
      <div className='h-full'>
        <Outlet />
      </div>
    </div>
  );
}
