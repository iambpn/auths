import { axiosInstance } from "@/lib/axiosInstance";
import { handleError } from "@/lib/handleError";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import SettingHeader from "../settings/settingHeader";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import SecurityQuestionForm, { SecurityQuestionType } from "./securityQuestion.form";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const securityQuestionQuery = useQuery<{
    question1s: string[];
    question2s: string[];
  }>({
    queryKey: ["cms", "getSecurityQuestions"],
    queryFn: async () => {
      const res = await axiosInstance.get("/cms/getSecurityQuestions");
      return res.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  useEffect(() => {
    if (securityQuestionQuery.isError) {
      handleError(securityQuestionQuery.error);
    }
  }, [securityQuestionQuery.error, securityQuestionQuery.isError]);

  const updateQnAMutationQuery = useMutation<
    {
      message: string;
    },
    unknown,
    SecurityQuestionType & { password: string }
  >({
    mutationFn: async (values) => {
      const res = await axiosInstance.put("/cms/updateSecurityQuestions", {
        question1: values.question1Idx,
        question2: values.question2Idx,
        answer1: values.answer1,
        answer2: values.answer2,
        password: values.password,
      });
      return res.data;
    },
    onSuccess(data) {
      toast.success(data.message);
    },
    onError(error) {
      handleError(error);
    },
  });

  const verifyFormSubmission: SubmitHandler<SecurityQuestionType> = (values) => {
    setQnA(values);
    setShowDialog(true);
  };

  const handleChangeQuestionSubmission: SubmitHandler<{ password: string }> = async (values) => {
    if (QnA) {
      await updateQnAMutationQuery.mutateAsync({ ...QnA, ...values });
      setShowDialog(false);
      // soft navigate back to the settings
      navigate("/", {
        state: { from: "/settings" },
      });
    }
  };

  return (
    <div className='space-x-2 w-full'>
      <div>
        <SettingHeader header='Security Questions' description='Change your Security Question here.' />
      </div>
      <div>
        <SecurityQuestionForm onSubmit={verifyFormSubmission} question1s={securityQuestionQuery.data?.question1s ?? []} question2s={securityQuestionQuery.data?.question2s ?? []} />
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
