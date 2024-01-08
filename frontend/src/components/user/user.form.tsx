import { useDebouncedValue } from "@/hooks/debounce";
import { axiosInstance } from "@/lib/axiosInstance";
import { PAGE_LIMIT } from "@/lib/config";
import { handleError } from "@/lib/handleError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { GrFormCheckmark } from "react-icons/gr";
import { z } from "zod";
import { SearchBox, SearchBoxItem } from "../search/searchBox";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const UserSchema = z
  .object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email({
        message: "Email must be a valid email address",
      }),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, {
        message: "Password must be at least 8 characters",
      }),
    confirmPassword: z
      .string({
        required_error: "Confirm Password is required",
      })
      .min(8, {
        message: "Password must be at least 8 characters",
      }),
    role: z
      .string({
        required_error: "Role is required",
      })
      .uuid({
        message: "Role must be a valid UUID",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm Password must be same as Password",
    path: ["confirmPassword"], // specify where this error belongs to
  });

export type UserType = z.infer<typeof UserSchema>;

type Props = {
  defaultValue?: Omit<UserType, "role" | "password" | "confirmPassword">;
  role?: Omit<APIResponse.Roles["GET-id"], "permissions">;
  onSubmit: SubmitHandler<UserType>;
};

export function UserFrom(props: Props) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [role, setRole] = useState<SearchBoxItem | undefined>();
  const debouncedKeyword = useDebouncedValue(searchKeyword, 300);

  const form = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      email: props.defaultValue ? props.defaultValue.email : "",
      role: props.role?.uuid ?? "",
    },
    mode: "onChange",
  });

  // update Selected Items
  useEffect(() => {
    if (props.role) {
      setRole({
        id: props.role.uuid,
        value: (
          <>
            <span className='capitalize'>{props.role.name}</span>
            <GrFormCheckmark className={"ml-auto h-4 w-4 opacity-100"} />
          </>
        ),
      });
    }
  }, [props.role]);

  const allRoleInfiniteQuery = useInfiniteQuery<Omit<APIResponse.Roles["GET-/"], "permissions">>({
    queryKey: ["roles", "infinite", debouncedKeyword],
    getNextPageParam: (prevData) => {
      return prevData.currentPage < prevData.totalPage ? prevData.currentPage + 1 : null;
    },
    queryFn: async (ctx) => {
      const res = await axiosInstance.get(`/roles`, {
        params: {
          page: ctx.pageParam ?? 0,
          limit: PAGE_LIMIT,
          keyword: debouncedKeyword,
          withPermission: false,
        },
      });
      return res.data;
    },
    enabled: true,
  });

  // error handler
  useEffect(() => {
    if (allRoleInfiniteQuery.isError) {
      handleError(allRoleInfiniteQuery.error);
    }
  }, [allRoleInfiniteQuery.error, allRoleInfiniteQuery.isError]);

  const flattenRoles = useCallback(() => {
    return allRoleInfiniteQuery.data?.pages.flatMap((data) => {
      return data.roles.map((roles) => {
        return {
          id: roles.uuid,
          value: (
            <>
              <span className='capitalize'>{roles.name}</span>
            </>
          ),
        };
      });
    });
  }, [allRoleInfiniteQuery.data?.pages]);

  const handleOnItemSelect = async (item: SearchBoxItem, isSelected: boolean) => {
    // select only one item
    if (isSelected) {
      setRole({
        ...item,
        value: (
          <>
            {item.value}
            <GrFormCheckmark className={"ml-auto h-4 w-4 opacity-100"} />
          </>
        ),
      });
    } else {
      setRole(undefined);
    }
  };

  // update role data in form
  useEffect(() => {
    form.setValue("role", role?.id as string);
    form.trigger(["role"]);
  }, [form, role]);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(props.onSubmit)} className='space-y-3'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <Label>Email</Label>
                <FormControl>
                  <Input type='email' placeholder='Mail@email.com' {...field} />
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
                  <Input type='password' placeholder='********' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <Label>Confirm Password</Label>
                <FormControl>
                  <Input type='password' placeholder='********' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='space-y-2'>
            <Label>Assign Role</Label>
            <SearchBox
              getSearchKeyword={(keyword) => setSearchKeyword(keyword)}
              searchItems={flattenRoles() ?? []}
              onItemSelect={handleOnItemSelect}
              onScrollBottomSearch={() => {
                if (allRoleInfiniteQuery.hasNextPage) {
                  allRoleInfiniteQuery.fetchNextPage();
                }
              }}
              selectedItems={role ? [role] : []}
              headingText='Search Result'
              searchPlaceholder='Search Roles ... '
            />
            <input hidden {...form.register("role")} />
            {form.formState.errors["role"]?.message && <FormMessage>{form.formState.errors["role"].message}</FormMessage>}
          </div>
          <div className='pt-2 flex justify-end'>
            <Button type='submit'>{props.defaultValue ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
