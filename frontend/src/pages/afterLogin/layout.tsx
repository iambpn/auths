import { Navbar } from "@/components/navbar/navbar";
import SecurityQuestionForm, { SecurityQuestionType } from "@/components/securityQuestion/securityQuestion.form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { Outlet } from "react-router-dom";

export default function AfterLoginLayout() {
  const [showDialog, setShowDialog] = useState(true);

  const closeDialog = (value: boolean) => {
    // api call and id security question is changed then only close dialog
    setShowDialog(true);
  };

  const saveSecurityQuestion: SubmitHandler<SecurityQuestionType> = (value) => {
    // make api call
  };

  return (
    <div className='h-full flex flex-col'>
      {showDialog && (
        <Dialog open={showDialog} onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Security Question</DialogTitle>
              <DialogDescription>Setup your security questions.</DialogDescription>
            </DialogHeader>
            <SecurityQuestionForm onSubmit={saveSecurityQuestion} questions={[]} disabled={true} defaultValues={{ question1: "", question2: "" }} submitBtn='Save Question' />
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
