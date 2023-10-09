import { PermissionForm, PermissionType } from "./components/permission.form";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";
import { SubmitHandler } from "react-hook-form";

export function CreatePermission() {
  // update Permission Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  useEffect(() => {
    updateActiveNavLink(NavName.permission);
  }, []);

  const onFormSubmit: SubmitHandler<PermissionType> = (data, e) => {
    console.log(data);
  };

  return (
    <div>
      <div className='mb-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Add Permission</h1>
      </div>
      <PermissionForm onSubmit={onFormSubmit} />
    </div>
  );
}
