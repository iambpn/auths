import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { SearchBox, SearchBoxItem } from "../search/searchBox";
import { useCallback, useEffect, useState } from "react";
import { GrFormCheckmark } from "react-icons/gr";
import { useDebouncedValue } from "@/hooks/debounce";
import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { PAGE_LIMIT } from "@/lib/config";
import { handleError } from "@/lib/handleError";

const word_with_underscore_regex = /[^a-zA-Z0-9_]/;

const UpdatePermissionSchema = z.object({
  name: z
    .string({
      required_error: "Permission name is required",
      invalid_type_error: "Permission name must be a string",
    })
    .trim()
    .min(2, {
      message: "Permission name must be at least 2 characters long",
    }),
  slug: z
    .string({
      required_error: "Permission slug is required",
      invalid_type_error: "Permission slug must be a string",
    })
    .trim()
    .min(2, {
      message: "Permission slug must be at least 2 characters long",
    })
    .refine((val) => !word_with_underscore_regex.test(val), {
      message: "Special characters are not allowed in slug",
    }),
  selectedRoles: z.string().optional(),
});

export type UpdatePermissionType = z.infer<typeof UpdatePermissionSchema>;

type Props = {
  defaultValue?: Omit<UpdatePermissionType, "selectedRoles">;
  onSubmit: SubmitHandler<UpdatePermissionType>;
  onScroll: () => void;
  roles: Omit<APIResponse.Roles["GET-id"], "permissions">[];
};

export function UpdatePermissionForm(props: Props) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedItems, setSelectedItems] = useState<SearchBoxItem[]>([]);
  const debouncedKeyword = useDebouncedValue(searchKeyword, 300);

  const form = useForm<UpdatePermissionType>({
    resolver: zodResolver(UpdatePermissionSchema),
    defaultValues: {
      name: props.defaultValue ? props.defaultValue.name : "",
      slug: props.defaultValue ? props.defaultValue.slug : "",
      selectedRoles: JSON.stringify(props.roles.map((x) => x.uuid)),
    },
    mode: "onChange",
  });

  // update Selected Items
  useEffect(() => {
    setSelectedItems(
      props.roles.map((role) => ({
        id: role.uuid,
        value: (
          <>
            <span className='capitalize'>{role.name}</span>
            <GrFormCheckmark className={"ml-auto h-4 w-4 opacity-100"} />
          </>
        ),
      }))
    );
  }, [props.roles]);

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

  const handleOnItemSelect = (item: SearchBoxItem, isSelected: boolean) => {
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
    form.setValue("selectedRoles", JSON.stringify(selectedItems.map((x) => x.id)));
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
                <Label>Permission Name</Label>
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
                <Label>Permission Slug</Label>
                <FormControl>
                  <Input placeholder='Slug' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='space-y-2'>
            <Label>Assign Roles</Label>
            <SearchBox
              getSearchKeyword={(keyword) => setSearchKeyword(keyword)}
              searchItems={flattenRoles() ?? []}
              onItemSelect={handleOnItemSelect}
              onScrollBottomSearch={() => {
                if (allRoleInfiniteQuery.hasNextPage) {
                  allRoleInfiniteQuery.fetchNextPage();
                }
              }}
              onScrollBottomSelected={props.onScroll}
              selectedItems={selectedItems}
              headingText='Search Result'
              searchPlaceholder='Search Roles ... '
            />
            <input hidden {...form.register("selectedRoles")} />
          </div>
          <div className='pt-2 flex justify-end'>
            <Button type='submit'>{props.defaultValue ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
