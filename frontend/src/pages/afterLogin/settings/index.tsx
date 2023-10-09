import ChangePassword from "./components/changePassword";
import SecurityQuestion from "./components/securityQuestion";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className='container p-5'>
      <div className='space-y-0.5'>
        <h2 className='text-2xl font-bold tracking-tight'>Settings</h2>
        <p className='text-muted-foreground'>Manage your account settings here.</p>
      </div>
      <Separator className='my-3' />
      <div className='flex flex-col justify-center items-center'>
        <div className='w-2/3'>
          <ChangePassword />
          <Separator className='my-6' />
          <SecurityQuestion />
        </div>
      </div>
    </div>
  );
}
