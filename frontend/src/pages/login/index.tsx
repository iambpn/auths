import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { axiosInstance } from "@/utils/axiosInstance";
import { handleError } from "@/utils/handleError";
import { getToken, setToken } from "@/utils/localstorage";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormSubmitHandler, SubmitHandler, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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
  const queryClient = useQueryClient();

  const loginMutateQuery = useMutation<
    {
      uuid: string;
      jwtToken: string;
    },
    any,
    LoginType
  >({
    mutationFn: async (values) => {
      const res = await axiosInstance.post("/cms/login", {
        email: values.email,
        password: values.password,
      });

      return res.data;
    },
    onError(error) {
      handleError(error);
    },
    onSuccess(data) {
      setToken(data.jwtToken);
      queryClient.invalidateQueries(["currentUser"], { exact: true });
      toast.success(`Successfully logged in.`);
    },
  });

  const submitForm: SubmitHandler<LoginType> = (values) => {
    loginMutateQuery.mutate(values);
  };

  return (
    <>
      <div className='h-full flex flex-col justify-center items-center p-2'>
        <div className='w-full sm:w-1/2 md:w-3/6 lg:w-2/6 xl:w-1/4 shadow-jubilation p-7 grid gap-7 rounded'>
          <div className='flex flex-col'>
            <span className='text-2xl pb-1'>Admin Login</span>
            <span className='text-sm text-gray-600'>Login to your account with Email and Password</span>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitForm)} className='space-y-3'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <FormControl>
                      <Input id='email' type='email' placeholder='Mail@example.com' {...field} />
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
                    <Label>Password</Label>
                    <FormControl>
                      <Input id='password' type='password' placeholder='********' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button className='w-full' type='submit' disabled={loginMutateQuery.isLoading}>
                  Login
                </Button>
              </div>
              <p className='px-8 text-center text-sm text-muted-foreground'>
                <Link to='/forgotpassword' className='hover:text-primary'>
                  Forgot your password?
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
