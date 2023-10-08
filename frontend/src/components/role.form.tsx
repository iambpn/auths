import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const word_with_underscore_regex = /[^a-zA-Z0-9_]/;

const RoleSchema = z.object({
  name: z
    .string({
      required_error: "Role name is required",
      invalid_type_error: "Role name must be a string",
    })
    .min(2, {
      message: "Role name must be at least 2 characters long",
    }),
  slug: z
    .string({
      required_error: "Role slug is required",
      invalid_type_error: "Role slug must be a string",
    })
    .refine((val) => !Boolean(word_with_underscore_regex.test(val)), {
      message: "Special characters are not allowed in slug",
    }),
});

type RoleType = z.infer<typeof RoleSchema>;

export function RoleForm() {
  const form = useForm<RoleType>({
    resolver: zodResolver(RoleSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
    mode: "onChange",
  });

  const onFormSubmit: SubmitHandler<RoleType> = (values, e) => {
    console.log(values);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='Role Name' {...field} />
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
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='Role Slug' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='pt-2 flex justify-end'>
            <Button type='submit'>Create</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
