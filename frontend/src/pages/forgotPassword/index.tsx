import SecurityQuestionForm, { SecurityQuestionType } from "@/components/securityQuestion/securityQuestion.form";
import SettingHeader from "@/components/settings/settingHeader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axiosInstance";
import { RESET_TOKEN } from "@/lib/config";
import { handleError } from "@/lib/handleError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const ValidateEmailSchema = z.object({
  email: z
    .string({
      required_error: "Please enter your email address",
    })
    .email({
      message: "Please enter a valid email address",
    }),
});

type ValidationEmailType = z.infer<typeof ValidateEmailSchema>;

export default function ForgotPassword() {
  const form = useForm<ValidationEmailType>({
    resolver: zodResolver(ValidateEmailSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const verifyEmailMutationQuery = useMutation<APIResponse.CMS["POST-verifyEmail"], unknown, ValidationEmailType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.post("cms/verifyEmail", {
        email: values.email,
      });

      return res.data;
    },
    onError(error) {
      handleError(error);
      navigate("/");
    },
  });

  const forgotPasswordMutationQuery = useMutation<APIResponse.CMS["POST-forgotPassword"], unknown, SecurityQuestionType>({
    mutationFn: async (values: SecurityQuestionType) => {
      const res = await axiosInstance.post("cms/forgotPassword", {
        email: email,
        answer1: values.answer1,
        answer2: values.answer2,
      });
      return res.data;
    },
    onError(error) {
      handleError(error);
      navigate("/");
    },
    onSuccess(data) {
      const expiresAt = new Date(data.expiresAt);
      const dateDiff = expiresAt.getTime() - Date.now();
      console.log(dateDiff);
      toast.success(`Reset Password expires in ${Math.round(dateDiff / (1000 * 60))} Minutes`);
      navigate(`/resetpassword?${RESET_TOKEN}=${data.token}`);
    },
  });

  const handleEmailSubmission: SubmitHandler<ValidationEmailType> = (values) => {
    setEmail(values.email);
    verifyEmailMutationQuery.mutate(values);
    setStep((prev) => prev + 1);
  };

  const handleSecurityQuestionSubmission: SubmitHandler<SecurityQuestionType> = (values) => {
    forgotPasswordMutationQuery.mutate(values);
  };

  return (
    <div className='container h-full flex flex-col'>
      <div className='p-4 flex '>
        <div>
          <span className='border border-[transparent] hover:border-inherit rounded-full p-1 inline-block cursor-pointer' onClick={() => navigate(-1)}>
            <MdArrowBack className='w-5 h-5' />
          </span>
        </div>
      </div>
      <div className='flex justify-center h-full items-center'>
        {step === 1 && (
          <div className='w-2/5 space-x-2'>
            <SettingHeader description='Enter you email address to reset password' header='Forget Password' />
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEmailSubmission)} className='pt-2'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type='email' className='w-full' placeholder='Email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='pt-3 flex justify-end'>
                  <Button type='submit'>Forgot Password</Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        {verifyEmailMutationQuery.isSuccess && step === 2 && (
          <div className='w-2/5 space-x-2'>
            <SettingHeader description='Enter your security question answers' header='Forget Password' />
            <SecurityQuestionForm
              onSubmit={handleSecurityQuestionSubmission}
              question1s={[verifyEmailMutationQuery.data.question1]}
              question2s={[verifyEmailMutationQuery.data.question2]}
              defaultValues={{ question1Idx: "0", question2Idx: "0" }}
              disabled={true}
              submitBtn='Reset Password'
            />
          </div>
        )}
      </div>
    </div>
  );
}
