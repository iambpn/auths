import { Outlet } from "react-router-dom";

export function InitialLayout() {
  return (
    <div className='h-screen'>
      <Outlet />
    </div>
  );
}
