import SecurityQuestionForm, { SecurityQuestionType } from "@/components/securityQuestion/securityQuestion.form";
import SettingHeader from "@/components/settings/settingHeader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
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

  const handleEmailSubmission: SubmitHandler<ValidationEmailType> = (values) => {
    setEmail(values.email);
    setStep((prev) => prev + 1);
  };

  const handleSecurityQuestionSubmission: SubmitHandler<SecurityQuestionType> = (values) => {};

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
        {step === 2 && (
          <div className='w-2/5 space-x-2'>
            <SettingHeader description='Enter your security question answers' header='Forget Password' />
            <SecurityQuestionForm onSubmit={handleSecurityQuestionSubmission} questions={[]} defaultValues={{ question1: "", question2: "" }} disabled={true} submitBtn='Reset Password' />
          </div>
        )}
      </div>
    </div>
  );
}
