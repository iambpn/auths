import { PaginationType } from "../validation_schema/cms/pagination.validation.schema";

export const PaginationQuery = (query: PaginationType) => ({
  limit: +query.limit,
  skip: Math.floor(+query.page * +query.limit),
});

export const PaginatedResponse = (totalCount: number, paginationQuery: ReturnType<typeof PaginationQuery>) => {
  const { limit, skip } = paginationQuery;
  const totalPage = Math.ceil(totalCount / limit);

  return {
    totalCount: totalCount,
    currentPage: skip / limit,
    pageSize: limit,
    totalPage: totalPage,
  };
};
