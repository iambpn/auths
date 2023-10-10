import ChangePassword from "@/components/changePassword/changePassword";
import SecurityQuestion from "@/components/securityQuestion/securityQuestion";
import SettingHeader from "@/components/settings/settingHeader";
import { Separator } from "@/components/ui/separator";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className='container py-4 px-3'>
      <div className='space-y-0.5 flex flex-row items-start'>
        <span className='border border-[transparent] hover:border-inherit rounded-full p-1 inline-block cursor-pointer' onClick={() => navigate(-1)}>
          <MdArrowBack className='w-5 h-5' />
        </span>
        <div className='px-2'>
          <SettingHeader header='Settings' description='Manage your account settings here.' />
        </div>
      </div>
      <Separator className='my-4' />
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
