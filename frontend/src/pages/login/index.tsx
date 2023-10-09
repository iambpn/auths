import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const LoginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Invalid email",
    }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, {
      message: "Password must be at least 8 characters long",
    }),
});

type LoginType = z.infer<typeof LoginSchema>;

export function Login() {
  const form = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  return (
    <>
      <div className='h-screen'>
        <div className='h-full flex flex-col justify-center items-center p-2'>
          <div className='w-full sm:w-1/2 md:w-3/6 lg:w-2/6 xl:w-1/4 shadow-jubilation p-7 grid gap-7 rounded'>
            <div className='flex flex-col'>
              <span className='text-2xl pb-1'>Admin Login</span>
              <span className='text-sm text-gray-600'>Login to your account with Email and Password</span>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(() => {})} className='space-y-3'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input id='email' type='email' placeholder='mail@example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input id='password' type='password' placeholder='********' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <Button className='w-full' type='submit'>
                    Login
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
