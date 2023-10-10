import SecurityQuestionForm from "@/components/securityQuestion/securityQuestion.form";
import SettingHeader from "@/components/settings/settingHeader";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

  return (
    <div className='container h-full flex flex-col'>
      <div className='p-4 flex '>
        <div>
          <span className='border border-[transparent] hover:border-inherit rounded-full p-1 inline-block cursor-pointer' onClick={() => navigate(-1)}>
            <MdArrowBack className='w-5 h-5' />
          </span>
        </div>
        <div className='pl-2'>
          <SettingHeader description='Fill the form below to reset your password.' header='Forget Password' />
        </div>
      </div>
      <div className='flex justify-center items-center h-full'>
        {step === 1 && (
          <div className='w-2/5'>
            <SettingHeader description='Fill the form below to reset your password.' header='Forget Password' />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(() => {})}>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <Label>Email</Label>
                      <FormControl>
                        <Input type='email' className='w-full' placeholder='Email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        )}
        {step === 2 && (
          <div className='w-2/5'>
            <h1 className='text-xl font-medium'>Security Question</h1>
            <p className='text-muted-foreground'>Enter your security question answers</p>
            <SecurityQuestionForm onSubmit={() => {}} questions={[]} defaultValues={{ question1: "", question2: "" }} />
          </div>
        )}
      </div>
    </div>
  );
}
