import { Label } from "@/components/ui/label";
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

const word_with_underscore_regex = /[^a-zA-Z0-9_]/;

const UpdateRoleSchema = z.object({
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
  selectedPermissions: z.string().optional(),
});

export type UpdateRoleType = z.infer<typeof UpdateRoleSchema>;

type Props = {
  defaultValue?: UpdateRoleType;
  onSubmit: SubmitHandler<UpdateRoleType>;
  permissions: APIResponse.Permission["GET-id"][];
};

export function UpdateRoleForm(props: Props) {
  const [selectedItems, setSelectedItems] = useState<SearchBoxItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(searchKeyword, 300);

  const form = useForm<UpdateRoleType>({
    resolver: zodResolver(UpdateRoleSchema),
    defaultValues: {
      name: props.defaultValue ? props.defaultValue.name : "",
      slug: props.defaultValue ? props.defaultValue.slug : "",
      selectedPermissions: props.defaultValue?.selectedPermissions
        ? props.defaultValue.selectedPermissions
        : JSON.stringify(props.permissions.map((x) => x.uuid)),
    },
    mode: "onChange",
  });

  const allPermissionInfiniteQuery = useInfiniteQuery<APIResponse.Permission["GET-/"]>({
    queryKey: ["permission", "infinite", debouncedKeyword],
    getNextPageParam: (prevData) => {
      return prevData.currentPage < prevData.totalPage ? prevData.currentPage + 1 : null;
    },
    queryFn: async (ctx) => {
      const res = await axiosInstance.get(`/permission`, {
        params: {
          page: ctx.pageParam ?? 0,
          limit: PAGE_LIMIT,
          keyword: debouncedKeyword,
        },
      });
      return res.data;
    },
    enabled: true,
  });

  useEffect(() => {
    if (allPermissionInfiniteQuery.isError) {
      handleError(allPermissionInfiniteQuery.error);
    }
  }, [allPermissionInfiniteQuery.error, allPermissionInfiniteQuery.isError]);

  const flattenPermission = useCallback(() => {
    return allPermissionInfiniteQuery.data?.pages.flatMap((data) => {
      return data.permissions.map((permission) => {
        return {
          id: permission.uuid,
          value: (
            <>
              <span className='capitalize'>{permission.name}</span>
            </>
          ),
        };
      });
    });
  }, [allPermissionInfiniteQuery.data?.pages]);

  const onAssignedPermissionChanged = (item: SearchBoxItem, isSelected: boolean) => {
    if (isSelected && !selectedItems.find((selectedItem) => selectedItem.id === item.id)) {
      setSelectedItems((prev) => [
        {
          ...item,
          value: (
            <>
              {item.value}
              <GrFormCheckmark className={"ml-auto h-4 w-4 opacity-100"} />
            </>
          ),
        },
        ...prev,
      ]);
    } else if (!isSelected) {
      setSelectedItems((prev) => prev.filter((selectedItem) => selectedItem.id !== item.id));
    }
  };

  useEffect(() => {
    setSelectedItems(
      props.permissions.map((perm) => ({
        id: perm.uuid,
        value: (
          <>
            <span className='capitalize'>{perm.name}</span>
            <GrFormCheckmark className={"ml-auto h-4 w-4 opacity-100"} />
          </>
        ),
      }))
    );
  }, [props.permissions]);

  useEffect(() => {
    form.setValue("selectedPermissions", JSON.stringify(selectedItems.map((x) => x.id)));
  }, [form, selectedItems]);

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
          <div className='space-y-2'>
            <Label>Add Permissions</Label>
            <SearchBox
              headingText='Search Result'
              getSearchKeyword={(keyword) => setSearchKeyword(keyword)}
              onScrollBottomSearch={() => {
                if (allPermissionInfiniteQuery.hasNextPage) {
                  allPermissionInfiniteQuery.fetchNextPage();
                }
              }}
              searchItems={flattenPermission() ?? []}
              selectedItems={selectedItems}
              onItemSelect={onAssignedPermissionChanged}
              searchPlaceholder='Search Permission ... '
            />
            <input hidden {...form.register("selectedPermissions")} />
          </div>
          <div className='pt-2 flex justify-end'>
            <Button type='submit'>{props.defaultValue ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
