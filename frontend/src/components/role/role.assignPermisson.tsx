import { useDebouncedValue } from "@/hooks/debounce";
import { axiosInstance } from "@/lib/axiosInstance";
import { PAGE_LIMIT } from "@/lib/config";
import { handleError } from "@/lib/handleError";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { SearchBox } from "../search/searchBox";

export function AssignPermissionToRole() {
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, 300);

  const permissionInfiniteQuery = useInfiniteQuery<APIResponse.Permission["GET-/"]>({
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
    if (permissionInfiniteQuery.isError) {
      handleError(permissionInfiniteQuery.error);
    }
  }, [permissionInfiniteQuery.error, permissionInfiniteQuery.isError]);

  const flattenPermission = useCallback(() => {
    return permissionInfiniteQuery.data?.pages.flatMap((data) => {
      return data.permissions.map((permission) => {
        return { id: permission.uuid, value: permission.name };
      });
    });
  }, [permissionInfiniteQuery.data?.pages]);

  const getSearchKeyword = (keyword: string) => {
    setKeyword(keyword);
  };

  const onScrollBottom = () => {
    if (permissionInfiniteQuery.hasNextPage) {
      permissionInfiniteQuery.fetchNextPage();
    }
  };

  return (
    <>
      <SearchBox headingText='Search Result' getSearchKeyword={getSearchKeyword} onScrollBottom={onScrollBottom} items={flattenPermission() ?? []} />
      <p>hol</p>
    </>
  );
}
