import SettingHeader from "@/components/settings/settingHeader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axiosInstance";
import { RESET_TOKEN } from "@/lib/config";
import { handleError } from "@/lib/handleError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const ValidateResetPasswordSchema = z
  .object({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters long",
    }),
  })
  .refine((val) => val.password === val.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password and confirm password did not matched",
  });

type ValidateResetPasswordType = z.infer<typeof ValidateResetPasswordSchema>;

export function ResetPassword() {
  const form = useForm<ValidateResetPasswordType>({
    resolver: zodResolver(ValidateResetPasswordSchema),
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
    mode: "onChange",
  });
  const [query] = useSearchParams();
  const navigate = useNavigate();

  const resetPasswordMutationQuery = useMutation<APIResponse.CMS["POST-resetPassword"], unknown, ValidateResetPasswordType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.post("/cms/resetPassword", {
        token: query.get(RESET_TOKEN),
        newPassword: values.confirmPassword,
      });
      return res.data;
    },
    onSuccess(data) {
      toast.success(data.message);
      navigate("/");
    },
    onError(error) {
      handleError(error);
    },
  });

  const handleSubmit: SubmitHandler<ValidateResetPasswordType> = (values) => {
    resetPasswordMutationQuery.mutate(values);
  };

  if (!query.has(RESET_TOKEN)) {
    return (
      <>
        <Navigate to={"/"} replace={true} />
      </>
    );
  }

  return (
    <>
      <div className='container h-full flex flex-col'>
        <div className='flex justify-center h-full items-center'>
          <div className='w-2/5 space-x-2'>
            <SettingHeader description='Enter your new password' header='Reset Password' />
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='pt-2'>
                <div className='border rounded-sm space-y-3 p-3 '>
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type='password' className='w-full' placeholder='New Password' {...field} />
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
                        <FormControl>
                          <Input type='password' className='w-full' placeholder='Confirm Password' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='pt-3 flex justify-end'>
                  <Button type='submit'>Reset Password</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
