import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import SettingHeader from "./settingHeader";

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

  const handleSubmit: SubmitHandler<ChangePasswordType> = (values) => {};

  return (
    <>
      <div className='space-x-2 w-full'>
        <div>
          <SettingHeader header='Change Password' description='Change your password here.' />
        </div>
        <Form {...form}>
          <form className='mt-2 space-y-2' onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <Label>Current Password</Label>
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
                  <Label>New Password</Label>
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
                  <Label>Confirm New Password</Label>
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
