import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const SecurityQuestionSchema = z.object({
  question1: z.string({
    required_error: "Question is required",
  }),
  answer1: z
    .string({
      required_error: "Answer is required",
    })
    .min(2, {
      message: "Answer must be at least 2 characters",
    }),
  question2: z.string({
    required_error: "Question is required",
  }),
  answer2: z
    .string({
      required_error: "Answer is required",
    })
    .min(2, {
      message: "Answer must be at least 2 characters",
    }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, {
      message: "Password must be at least 8 characters",
    }),
});

export type SecurityQuestionType = z.infer<typeof SecurityQuestionSchema>;

type Props = {
  questions: { id: string; question: string }[];
  defaultValues?: Omit<SecurityQuestionType, "answer1" | "answer2" | "password">;
  onSubmit: SubmitHandler<SecurityQuestionType>;
};

export default function SecurityQuestionForm(props: Props) {
  const form = useForm<SecurityQuestionType>({
    resolver: zodResolver(SecurityQuestionSchema),
    defaultValues: {
      question1: props.defaultValues ? props.defaultValues.question1 : "",
      answer1: "",
      question2: props.defaultValues ? props.defaultValues.question2 : "",
      answer2: "",
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form className='mt-2 space-y-2' onSubmit={form.handleSubmit(props.onSubmit)}>
        <FormField
          control={form.control}
          name='question1'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question 1</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Question' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Questions</SelectLabel>
                      {props.questions.map((q) => (
                        <SelectItem value={q.id}>{q.question}</SelectItem>
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
          name='question2'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question 2</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Question' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Questions</SelectLabel>
                      {props.questions.map((q) => (
                        <SelectItem value={q.id}>{q.question}</SelectItem>
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

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <Label>Password</Label>
              <FormControl>
                <Input type='password' className='w-full' placeholder='Current Password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='pt-2'>
          <Button type='submit'>Change Password</Button>
        </div>
      </form>
    </Form>
  );
}
