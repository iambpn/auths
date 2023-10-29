import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "../ui/label";

const SecurityQuestionSchema = z.object({
  question1Idx: z
    .string({
      required_error: "Question is required",
    })
    .min(2, {
      message: "You must select a question",
    }),
  answer1: z
    .string({
      required_error: "Answer is required",
    })
    .min(2, {
      message: "Answer must be at least 2 characters",
    }),
  question2Idx: z
    .string({
      required_error: "Question is required",
    })
    .min(2, {
      message: "You must select a question",
    }),
  answer2: z
    .string({
      required_error: "Answer is required",
    })
    .min(2, {
      message: "Answer must be at least 2 characters",
    }),
});

export type SecurityQuestionType = z.infer<typeof SecurityQuestionSchema>;

type Props = {
  question1s: string[];
  question2s: string[];
  defaultValues?: Omit<SecurityQuestionType, "answer1" | "answer2" | "password">;
  disabled?: boolean;
  onSubmit: SubmitHandler<SecurityQuestionType>;
  submitBtn?: string;
};

export default function SecurityQuestionForm(props: Props) {
  const form = useForm<SecurityQuestionType>({
    resolver: zodResolver(SecurityQuestionSchema),
    defaultValues: {
      question1Idx: props.defaultValues ? props.defaultValues.question1Idx : "",
      answer1: "",
      question2Idx: props.defaultValues ? props.defaultValues.question2Idx : "",
      answer2: "",
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form className='mt-2 space-y-2' onSubmit={form.handleSubmit(props.onSubmit)}>
        <FormField
          control={form.control}
          name='question1Idx'
          render={({ field }) => (
            <FormItem>
              <Label>Question 1</Label>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={props.disabled}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Question' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Questions</SelectLabel>
                      {props.question1s.map((q, idx) => (
                        <SelectItem value={idx.toString()}>{q}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='answer1'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type='text' className='w-full' placeholder='Your Answer' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='question2Idx'
          render={({ field }) => (
            <FormItem>
              <Label>Question 2</Label>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={props.disabled}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Question' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Questions</SelectLabel>
                      {props.question2s.map((q, idx) => (
                        <SelectItem value={idx.toString()}>{q}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='answer2'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type='text' className='w-full' placeholder='Your Answer' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='pt-2'>
          <Button type='submit'>{props.submitBtn ? props.submitBtn : "Change Question"}</Button>
        </div>
      </form>
    </Form>
  );
}
