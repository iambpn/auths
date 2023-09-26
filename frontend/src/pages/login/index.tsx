import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Login() {
  return (
    <>
      <div className='h-screen'>
        <div className='h-full flex flex-col justify-center items-center'>
          <div className='w-1/5 shadow-jubilation p-7 grid gap-7 rounded'>
            <div className='flex flex-col'>
              <span className='text-2xl pb-1'>Admin Login</span>
              <span className='text-sm text-gray-600'>Login to your account with Email and Password</span>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' placeholder='mail@example.com' />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' placeholder='********' />
            </div>
            <div>
              <Button className='w-full'>Login</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
