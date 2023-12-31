import { Navbar } from "@/components/navbar/navbar";
import SecurityQuestionForm, { SecurityQuestionType } from "@/components/securityQuestion/securityQuestion.form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { axiosInstance } from "@/lib/axiosInstance";
import { handleError } from "@/lib/handleError";
import { useAppStore } from "@/store/useAppStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { Outlet } from "react-router-dom";
import { toast } from "sonner";

export default function AfterLoginLayout() {
  const [showDialog, setShowDialog] = useState(false);
  const currentUser = useAppStore.getState().currentUser;

  const verifyEmailQuery = useQuery<APIResponse.CMS["POST-verifyEmail"]>({
    queryKey: ["cms", "verifyEmail", currentUser?.email],
    queryFn: async () => {
      const res = await axiosInstance.post("/cms/verifyEmail", {
        email: currentUser?.email,
      });
      return res.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (verifyEmailQuery.isError) {
      handleError(verifyEmailQuery.error);
      setShowDialog(true);
    }
  }, [verifyEmailQuery.isError, verifyEmailQuery.error]);

  const securityQuestionQuery = useQuery<APIResponse.CMS["GET-getSecurityQuestion"]>({
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

  const securityQuestionMutationQuery = useMutation<APIResponse.CMS["POST-setSecurityQuestion"], unknown, SecurityQuestionType>({
    mutationFn: async (values) => {
      const res = await axiosInstance.post("/cms/setSecurityQuestions", {
        question1: values.question1Idx,
        answer1: values.answer1,
        question2: values.question2Idx,
        answer2: values.answer2,
      });

      return res.data;
    },
    onError(error) {
      handleError(error);
    },
    onSuccess(data) {
      toast.success(data.message);
      setShowDialog(false);
    },
  });

  const closeDialog: (state?: boolean) => void = () => {
    verifyEmailQuery.refetch({
      cancelRefetch: true,
    });

    if (verifyEmailQuery.data) {
      setShowDialog(false);
    } else {
      toast.error("You must setup security questions.");
    }
  };

  const saveSecurityQuestion: SubmitHandler<SecurityQuestionType> = (value) => {
    securityQuestionMutationQuery.mutate(value);
  };

  return (
    <div className='h-full flex flex-col'>
      {securityQuestionQuery.isSuccess && showDialog && (
        <Dialog open={showDialog} onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Security Question</DialogTitle>
              <DialogDescription>Setup your security questions.</DialogDescription>
            </DialogHeader>
            <SecurityQuestionForm
              onSubmit={saveSecurityQuestion}
              question1s={securityQuestionQuery.data.question1s}
              question2s={securityQuestionQuery.data.question2s}
              disabled={false}
              defaultValues={{ question1Idx: "", question2Idx: "" }}
              submitBtn='Save Question'
            />
          </DialogContent>
        </Dialog>
      )}
      <div className='w-full'>
        <Navbar />
      </div>
      <div className='h-full'>
        <Outlet />
      </div>
    </div>
  );
}
