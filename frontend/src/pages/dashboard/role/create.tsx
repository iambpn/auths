import { RoleForm } from "@/components/role.form";
import { NavName } from "@/lib/navName";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

export function CreateRole() {
  // update Permission Nav Selection
  const updateActiveNavLink = useAppStore((state) => state.setActiveNav);
  useEffect(() => {
    updateActiveNavLink(NavName.roles);
  }, []);
  return (
    <div>
      <RoleForm />
    </div>
  );
}
