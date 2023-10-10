import { RoleForm, RoleType } from "@/components/role/role.form";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";
import { SubmitHandler } from "react-hook-form";

export function EditRole() {
  // update Permission Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  useEffect(() => {
    updateActiveNavLink(NavName.roles);
  }, []);

  const onFormSubmit: SubmitHandler<RoleType> = (data, e) => {
    console.log(data);
  };

  return (
    <div>
      <div className='mb-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Edit Roles</h1>
      </div>
      <RoleForm onSubmit={onFormSubmit} defaultValue={{ name: "role name", slug: "role slug" }} />
    </div>
  );
}
