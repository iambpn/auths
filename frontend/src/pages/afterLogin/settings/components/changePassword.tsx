import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: "Password is required",
      })
      .min(8, {
        message: "Password must be at least 8 characters long",
      }),
    newPassword: z
      .string({
        required_error: "New Password is required",
      })
      .min(8, {
        message: "New Password must be at least 8 characters long",
      }),
    confirmPassword: z
      .string({
        required_error: "Confirm Password is required",
      })
      .min(8, {
        message: "Confirm Password must be same as New Password",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirm Password must be same as New Password",
    path: ["confirmPassword"], // specify where this error belongs to
  });

type ChangePasswordType = z.infer<typeof ChangePasswordSchema>;

export default function ChangePassword() {
  const form = useForm<ChangePasswordType>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    },
    mode: "onChange",
  });

  return (
    <>
      <div className='space-x-2 w-full'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Change Password</h2>
          <p className='text-muted-foreground'>Change your password here.</p>
        </div>
        <Form {...form}>
          <form className='mt-2 space-y-2' onSubmit={form.handleSubmit(() => {})}>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type='password' className='w-full rounded-sm' placeholder='Current Password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type='password' className='w-full rounded-sm' placeholder='New Password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type='password' className='w-full rounded-sm' placeholder='Confirm New Password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='pt-2'>
              <Button type='submit'>Change Password</Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
