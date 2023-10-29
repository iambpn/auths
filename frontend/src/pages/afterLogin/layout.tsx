import { Navbar } from "@/components/navbar/navbar";
import SecurityQuestionForm, { SecurityQuestionType } from "@/components/securityQuestion/securityQuestion.form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { axiosInstance } from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { Outlet } from "react-router-dom";

export default function AfterLoginLayout() {
  const [showDialog, setShowDialog] = useState(true);

  const securityQuestionQuery = useQuery<{
    question1s: string[];
    question2s: string[];
  }>({
    queryKey: ["cms", "getSecurityQuestions"],
    queryFn: async () => {
      const res = await axiosInstance.get("/cms/getSecurityQuestions");
      return res.data;
    },
  });

  const closeDialog = (value: boolean) => {
    // api call and id security question is changed then only close dialog
    setShowDialog(true);
  };

  const saveSecurityQuestion: SubmitHandler<SecurityQuestionType> = (value) => {
    // make api call
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
              question2s={securityQuestionQuery.data.question1s}
              disabled={true}
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
