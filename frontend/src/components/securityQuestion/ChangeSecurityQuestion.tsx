import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import SettingHeader from "../settings/settingHeader";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import SecurityQuestionForm, { SecurityQuestionType } from "./securityQuestion.form";

const VerifyPasswordSchema = z.object({
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, {
      message: "Password must be at least 8 characters",
    }),
});

type VerifyPasswordType = z.infer<typeof VerifyPasswordSchema>;

export default function ChangeSecurityQuestion() {
  const form = useForm<VerifyPasswordType>({
    resolver: zodResolver(VerifyPasswordSchema),
    defaultValues: {
      password: "",
    },
    mode: "onChange",
  });
  const [showDialog, setShowDialog] = useState(false);
  const [QnA, setQnA] = useState<SecurityQuestionType>();

  const verifyFormSubmission: SubmitHandler<SecurityQuestionType> = (values) => {
    setQnA(values);
    setShowDialog(true);
  };

  const handleChangeQuestionSubmission: SubmitHandler<{ password: string }> = (values) => {
    setShowDialog(false);
  };

  return (
    <div className='space-x-2 w-full'>
      <div>
        <SettingHeader header='Security Questions' description='Change your Security Question here.' />
      </div>
      <div>
        <SecurityQuestionForm onSubmit={verifyFormSubmission} question1s={[]} question2s={[]} />
        <Dialog
          open={showDialog}
          onOpenChange={(open) => {
            setShowDialog(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm password to continue</DialogTitle>
              <DialogDescription className='text-muted-foreground'>Enter your password to save change</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleChangeQuestionSubmission)}>
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type='password' className='w-full' placeholder='Enter your password' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className='mt-2'>
                  <Button type='submit'>Confirm</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
