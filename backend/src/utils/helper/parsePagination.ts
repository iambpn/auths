import { PaginationType } from "../validation_schema/cms/pagination.validation.schema";

export const PaginationQuery = (query: PaginationType) => ({
  limit: +query.limit,
  skip: Math.floor(+query.page * +query.limit),
});
