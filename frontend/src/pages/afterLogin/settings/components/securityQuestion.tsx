import { SubmitHandler } from "react-hook-form";
import SecurityQuestionForm, { SecurityQuestionType } from "./securityQuestion.form";
import SettingHeader from "./settingHeader";

export default function SecurityQuestion() {
  const handleFormSubmission: SubmitHandler<SecurityQuestionType> = (values) => {};

  return (
    <div className='space-x-2 w-full'>
      <div>
        <SettingHeader header='Security Questions' description='Change your Security Question here.' />
      </div>
      <SecurityQuestionForm onSubmit={handleFormSubmission} questions={[]} />
    </div>
  );
}
