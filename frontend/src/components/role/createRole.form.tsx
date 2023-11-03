import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

const word_with_underscore_regex = /[^a-zA-Z0-9_]/;

const CreateRoleSchema = z.object({
  name: z
    .string({
      required_error: "Role name is required",
      invalid_type_error: "Role name must be a string",
    })
    .trim()
    .min(2, {
      message: "Role name must be at least 2 characters long",
    }),
  slug: z
    .string({
      required_error: "Role slug is required",
      invalid_type_error: "Role slug must be a string",
    })
    .trim()
    .min(2, {
      message: "Role slug must be at least 2 characters long",
    })
    .refine((val) => !word_with_underscore_regex.test(val), {
      message: "Special characters are not allowed in slug",
    }),
});

export type CreateRoleType = z.infer<typeof CreateRoleSchema>;

type Props = {
  defaultValue?: CreateRoleType;
  onSubmit: SubmitHandler<CreateRoleType>;
};

export function CreateRoleForm(props: Props) {
  const form = useForm<CreateRoleType>({
    resolver: zodResolver(CreateRoleSchema),
    defaultValues: {
      name: props.defaultValue ? props.defaultValue.name : "",
      slug: props.defaultValue ? props.defaultValue.slug : "",
    },
    mode: "onChange",
  });

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(props.onSubmit)} className='space-y-3'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <Label>Role Name</Label>
                <FormControl>
                  <Input placeholder='Name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem>
                <Label>Role Slug</Label>
                <FormControl>
                  <Input placeholder='Slug' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='pt-2 flex justify-end'>
            <Button type='submit'>{props.defaultValue ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
